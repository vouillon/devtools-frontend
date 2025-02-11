// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Coordinator from '../components/render_coordinator/render_coordinator.js';

import {processForDebugging, processStartLoggingForDebugging} from './Debugging.js';
import {getDomState, visibleOverlap} from './DomState.js';
import {type Loggable} from './Loggable.js';
import {getLoggingConfig} from './LoggingConfig.js';
import {logChange, logClick, logDrag, logHover, logImpressions, logKeyDown, logResize} from './LoggingEvents.js';
import {getLoggingState, getOrCreateLoggingState} from './LoggingState.js';
import {getNonDomState, unregisterAllLoggables, unregisterLoggable} from './NonDomState.js';

const PROCESS_DOM_INTERVAL = 500;
const KEYBOARD_LOG_INTERVAL = 3000;
const HOVER_LOG_INTERVAL = 1000;
const DRAG_LOG_INTERVAL = 1250;
const DRAG_REPORT_THRESHOLD = 50;
const CLICK_LOG_INTERVAL = 500;
const RESIZE_LOG_INTERVAL = 1000;
const RESIZE_REPORT_THRESHOLD = 50;

const noOpThrottler = {
  schedule: async () => {},
} as unknown as Common.Throttler.Throttler;

let processingThrottler = noOpThrottler;
export let keyboardLogThrottler = noOpThrottler;
let hoverLogThrottler = noOpThrottler;
let dragLogThrottler = noOpThrottler;
export let clickLogThrottler = noOpThrottler;
export let resizeLogThrottler = noOpThrottler;

const mutationObservers = new WeakMap<Node, MutationObserver>();
const documents: Document[] = [];

function observeMutations(roots: Node[]): void {
  for (const root of roots) {
    if (!mutationObservers.has(root)) {
      const observer = new MutationObserver(scheduleProcessing);
      observer.observe(root, {attributes: true, childList: true, subtree: true});
      mutationObservers.set(root, observer);
    }
  }
}

let logging = false;

export function isLogging(): boolean {
  return logging;
}

export async function startLogging(options?: {
  processingThrottler?: Common.Throttler.Throttler,
  keyboardLogThrottler?: Common.Throttler.Throttler,
  hoverLogThrottler?: Common.Throttler.Throttler,
  dragLogThrottler?: Common.Throttler.Throttler,
  clickLogThrottler?: Common.Throttler.Throttler,
  resizeLogThrottler?: Common.Throttler.Throttler,
}): Promise<void> {
  logging = true;
  processingThrottler = options?.processingThrottler || new Common.Throttler.Throttler(PROCESS_DOM_INTERVAL);
  keyboardLogThrottler = options?.keyboardLogThrottler || new Common.Throttler.Throttler(KEYBOARD_LOG_INTERVAL);
  hoverLogThrottler = options?.hoverLogThrottler || new Common.Throttler.Throttler(HOVER_LOG_INTERVAL);
  dragLogThrottler = options?.dragLogThrottler || new Common.Throttler.Throttler(DRAG_LOG_INTERVAL);
  clickLogThrottler = options?.clickLogThrottler || new Common.Throttler.Throttler(CLICK_LOG_INTERVAL);
  resizeLogThrottler = options?.resizeLogThrottler || new Common.Throttler.Throttler(RESIZE_LOG_INTERVAL);
  processStartLoggingForDebugging();
  await addDocument(document);
}

export async function addDocument(document: Document): Promise<void> {
  documents.push(document);
  if (['interactive', 'complete'].includes(document.readyState)) {
    await process();
  }
  document.addEventListener('visibilitychange', scheduleProcessing);
  document.addEventListener('scroll', scheduleProcessing);
  observeMutations([document.body]);
}

export function stopLogging(): void {
  logging = false;
  unregisterAllLoggables();
  for (const document of documents) {
    document.removeEventListener('visibilitychange', scheduleProcessing);
    document.removeEventListener('scroll', scheduleProcessing);
    mutationObservers.get(document.body)?.disconnect();
    mutationObservers.delete(document.body);
  }
  const {shadowRoots} = getDomState(documents);
  for (const shadowRoot of shadowRoots) {
    mutationObservers.get(shadowRoot)?.disconnect();
    mutationObservers.delete(shadowRoot);
  }
  documents.length = 0;
  processingThrottler = noOpThrottler;
}

export function scheduleProcessing(): void {
  if (!processingThrottler) {
    return;
  }
  void processingThrottler.schedule(
      () => Coordinator.RenderCoordinator.RenderCoordinator.instance().read('processForLogging', process));
}

async function process(): Promise<void> {
  if (document.hidden) {
    return;
  }
  const startTime = performance.now();
  const {loggables, shadowRoots} = getDomState(documents);
  const visibleLoggables: Loggable[] = [];
  const viewportRects = new Map<Document, DOMRect>();
  observeMutations(shadowRoots);

  const viewportRectFor = (element: Element): DOMRect => {
    const ownerDocument = element.ownerDocument;
    const viewportRect = viewportRects.get(ownerDocument) ||
        new DOMRect(0, 0, ownerDocument.defaultView?.innerWidth || 0, ownerDocument.defaultView?.innerHeight || 0);
    viewportRects.set(ownerDocument, viewportRect);
    return viewportRect;
  };

  for (const {element, parent} of loggables) {
    const loggingState = getOrCreateLoggingState(element, getLoggingConfig(element), parent);
    if (!loggingState.impressionLogged) {
      const overlap = visibleOverlap(element, viewportRectFor(element));
      const visibleSelectOption = element.tagName === 'OPTION' && loggingState.parent?.selectOpen;
      if (overlap || visibleSelectOption) {
        if (overlap) {
          loggingState.size = overlap;
        }
        visibleLoggables.push(element);
        loggingState.impressionLogged = true;
      }
    }
    if (!loggingState.processed) {
      const clickLikeHandler = (doubleClick: boolean) => (e: Event) => {
        const loggable = e.currentTarget as Element;
        logClick(clickLogThrottler)(loggable, e, {doubleClick});
      };
      if (loggingState.config.track?.click) {
        element.addEventListener('click', clickLikeHandler(false), {capture: true});
        element.addEventListener('contextmenu', clickLikeHandler(false), {capture: true});
      }
      if (loggingState.config.track?.dblclick) {
        element.addEventListener('dblclick', clickLikeHandler(true), {capture: true});
      }
      const trackHover = loggingState.config.track?.hover;
      if (trackHover) {
        element.addEventListener('mouseover', logHover(hoverLogThrottler), {capture: true});
        element.addEventListener('mouseout', () => hoverLogThrottler.schedule(cancelLogging), {capture: true});
      }
      const trackDrag = loggingState.config.track?.drag;
      if (trackDrag) {
        element.addEventListener('pointerdown', onDragStart, {capture: true});
        document.addEventListener('pointerup', maybeCancelDrag, {capture: true});
        document.addEventListener('dragend', maybeCancelDrag, {capture: true});
      }
      if (loggingState.config.track?.change) {
        element.addEventListener('change', logChange, {capture: true});
      }
      const trackKeyDown = loggingState.config.track?.keydown;
      if (trackKeyDown) {
        element.addEventListener('keydown', e => logKeyDown(keyboardLogThrottler)(e.currentTarget, e), {capture: true});
      }
      if (loggingState.config.track?.resize) {
        const updateSize = (): void => {
          const overlap = visibleOverlap(element, viewportRectFor(element)) || new DOMRect(0, 0, 0, 0);
          if (!loggingState.size) {
            return;
          }
          if (Math.abs(overlap.width - loggingState.size.width) >= RESIZE_REPORT_THRESHOLD ||
              Math.abs(overlap.height - loggingState.size.height) >= RESIZE_REPORT_THRESHOLD) {
            void logResize(resizeLogThrottler)(element, overlap);
          }
        };
        new ResizeObserver(updateSize).observe(element);
        new IntersectionObserver(updateSize).observe(element);
      }
      if (element.tagName === 'SELECT') {
        const onSelectOpen = (): void => {
          if (loggingState.selectOpen) {
            return;
          }
          loggingState.selectOpen = true;
          scheduleProcessing();
        };
        element.addEventListener('click', onSelectOpen, {capture: true});
        // Based on MenuListSelectType::ShouldOpenPopupForKey{Down,Press}Event
        element.addEventListener('keydown', event => {
          const e = event as KeyboardEvent;
          if ((Host.Platform.isMac() || e.altKey) && (e.code === 'ArrowDown' || e.code === 'ArrowUp') ||
              (!e.altKey && !e.ctrlKey && e.code === 'F4')) {
            onSelectOpen();
          }
        }, {capture: true});
        element.addEventListener('keypress', event => {
          const e = event as KeyboardEvent;
          if (e.key === ' ' || !Host.Platform.isMac() && e.key === '\r') {
            onSelectOpen();
          }
        }, {capture: true});
        element.addEventListener('change', e => {
          for (const option of (element as HTMLSelectElement).selectedOptions) {
            if (getLoggingState(option)?.config.track?.click) {
              void logClick(clickLogThrottler)(option, e);
            }
          }
        }, {capture: true});
      }
      loggingState.processed = true;
    }
    processForDebugging(element);
  }
  for (const {loggable, config, parent} of getNonDomState().loggables) {
    const loggingState = getOrCreateLoggingState(loggable, config, parent);
    const visible = !parent || loggingState.parent?.impressionLogged;
    if (!visible) {
      continue;
    }
    processForDebugging(loggable);
    visibleLoggables.push(loggable);
    loggingState.impressionLogged = true;
    // No need to track loggable as soon as we've logged the impression
    // We can still log interaction events with a handle to a loggable
    unregisterLoggable(loggable);
  }
  await logImpressions(visibleLoggables);
  Host.userMetrics.visualLoggingProcessingDone(performance.now() - startTime);
}

async function cancelLogging(): Promise<void> {
}

let dragStartX = 0, dragStartY = 0;

function onDragStart(event: Event): void {
  if (!(event instanceof MouseEvent)) {
    return;
  }
  dragStartX = event.screenX;
  dragStartY = event.screenY;
  void logDrag(dragLogThrottler)(event);
}

function maybeCancelDrag(event: Event): void {
  if (!(event instanceof MouseEvent)) {
    return;
  }
  if (Math.abs(event.screenX - dragStartX) >= DRAG_REPORT_THRESHOLD ||
      Math.abs(event.screenY - dragStartY) >= DRAG_REPORT_THRESHOLD) {
    return;
  }
  void dragLogThrottler.schedule(cancelLogging);
}
