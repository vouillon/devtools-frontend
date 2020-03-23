// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as UI from '../ui/ui.js';
import * as SDK from '../sdk/sdk.js';

class AffectedCookiesView {
  /**
   *
   * @param {!AggregatedIssueView} parent
   * @param {!SDK.Issue.AggregatedIssue} issue
   */
  constructor(parent, issue) {
    /** @type {!AggregatedIssueView} */
    this._parent = parent;
    /** @type {!SDK.Issue.AggregatedIssue} */
    this._issue = issue;
    this._wrapper = createElementWithClass('div', 'affected-resource');
    /** @type {!Element} */
    this._affectedCookiesCounter = this.createAffectedCookiesCounter(this._wrapper);
    /** @type {!Element} */
    this._affectedCookies = this.createAffectedCookies(this._wrapper);
    this._cookiesCount = 0;
  }

  /**
   * @param {!Element} wrapper
   * @returns {!Element}
   */
  createAffectedCookiesCounter(wrapper) {
    const counterLabel = createElementWithClass('div', 'affected-resource-label');
    counterLabel.addEventListener('click', () => {
      wrapper.classList.toggle('expanded');
    });
    wrapper.appendChild(counterLabel);
    return counterLabel;
  }

  /**
   * @param {!Element} wrapper
   * @returns {!Element}
   */
  createAffectedCookies(wrapper) {
    const body = createElementWithClass('div', 'affected-resource-wrapper');
    const affectedCookies = createElementWithClass('table', 'affected-resource-cookies');
    const header = createElementWithClass('tr');

    const name = createElementWithClass('td', 'affected-resource-header');
    name.textContent = 'Name';
    header.appendChild(name);

    const info = createElementWithClass('td', 'affected-resource-header affected-resource-header-info');
    // Prepend a space to align them better with cookie domains starting with a "."
    info.textContent = '\u2009Context';
    header.appendChild(info);

    affectedCookies.appendChild(header);
    body.appendChild(affectedCookies);
    wrapper.appendChild(body);

    this._parent.appendAffectedResource(wrapper);
    return affectedCookies;
  }

  /**
   * TODO(chromium:1063765): Strengthen types.
   * @param {!Iterable<*>} cookies
   */
  _appendAffectedCookies(cookies) {
    for (const cookie of cookies) {
      this.appendAffectedCookie(/** @type{!{name:string,path:string,domain:string,siteForCookies:string}} */ (cookie));
    }
    this._updateAffectedCookiesCounter();
  }

  /**
   *
   * @param {!{name:string,path:string,domain:string,siteForCookies:string}} cookie
   */
  appendAffectedCookie(cookie) {
    const element = createElementWithClass('tr', 'affected-resource-cookie');
    const name = createElementWithClass('td', '');
    name.appendChild(Components.Linkifier.linkifyRevealable(
        new SDK.Cookie.CookieReference(cookie.name, cookie.domain, cookie.path, cookie.siteForCookies), cookie.name));
    const info = createElementWithClass('td', 'affected-resource-cookie-info');

    // Prepend a space for all domains not starting with a "." to align them better.
    info.textContent = (cookie.domain[0] !== '.' ? '\u2008' : '') + cookie.domain + cookie.path;

    element.appendChild(name);
    element.appendChild(info);
    this._affectedCookies.appendChild(element);
  }

  _updateAffectedCookiesCounter() {
    this._cookiesCount = this._issue.numberOfCookies();
    this._affectedCookiesCounter.textContent = ls`${this._cookiesCount} cookies`;
    this._wrapper.style.display = this._cookiesCount === 0 ? 'none' : '';
    this._parent.updateAffectedResourceVisibility();
  }

  update() {
    this._affectedCookies.textContent = '';
    this._appendAffectedCookies(this._issue.cookies());
  }

  isEmpty() {
    return this._cookiesCount === 0;
  }

  detach() {
  }
}

class AggregatedIssueView extends UI.Widget.Widget {
  /**
   *
   * @param {!IssuesPaneImpl} parent
   * @param {!SDK.Issue.AggregatedIssue} issue
   */
  constructor(parent, issue) {
    super(false);
    this._parent = parent;
    this._issue = issue;
    this._details = issueDetails[issue.code()];
    this.appendHeader();
    this._body = this.createBody();
    this._affectedResources = this.createAffectedResources(this._body);
    this._affectedCookiesView = new AffectedCookiesView(this, this._issue);
    this._affectedCookiesView.update();

    this.contentElement.classList.add('issue');
    this.contentElement.classList.add('collapsed');

    this.updateAffectedResourceVisibility();
  }

  /**
   * @param {!Element} resource
   */
  appendAffectedResource(resource) {
    this._affectedResources.appendChild(resource);
  }

  appendHeader() {
    const header = createElementWithClass('div', 'header');
    header.addEventListener('click', this._handleClick.bind(this));
    const icon = UI.Icon.Icon.create('largeicon-breaking-change', 'icon');
    header.appendChild(icon);

    const title = createElementWithClass('div', 'title');
    title.textContent = this._details.title;
    header.appendChild(title);

    const priority = createElementWithClass('div', 'priority');
    switch (this._details.priority) {
      case Priority.High:
        priority.textContent = ls`High Priority`;
        break;
      default:
        console.warn('Unknown issue priority', this._details.priority);
    }
    header.appendChild(priority);
    this.contentElement.appendChild(header);
  }

  updateAffectedResourceVisibility() {
    const noResources = !this._affectedCookiesView || this._affectedCookiesView.isEmpty();
    this._affectedResources.style.display = noResources ? 'none' : '';
  }

  /**
   *
   * @param {!Element} body
   * @returns {!Element}
   */
  createAffectedResources(body) {
    const wrapper = createElementWithClass('div', 'affected-resources');
    const label = createElementWithClass('div', 'affected-resources-label');
    label.textContent = 'Affected Resources';
    wrapper.appendChild(label);
    body.appendChild(wrapper);
    return wrapper;
  }

  createBody() {
    const body = createElementWithClass('div', 'body');

    const message = createElementWithClass('div', 'message');
    message.textContent = this._details.message;
    body.appendChild(message);

    const code = createElementWithClass('div', 'code');
    code.textContent = this._issue.code();
    body.appendChild(code);

    const link = UI.XLink.XLink.create(this._details.link, 'Read more · ' + this._details.linkTitle, 'link');
    body.appendChild(link);

    const linkIcon = UI.Icon.Icon.create('largeicon-link', 'link-icon');
    link.prepend(linkIcon);

    const bodyWrapper = createElementWithClass('div', 'body-wrapper');
    bodyWrapper.appendChild(body);
    this.contentElement.appendChild(bodyWrapper);
    return body;
  }

  _handleClick() {
    this._parent.handleSelect(this);
  }

  update() {
    this._affectedCookiesView.update();
  }


  /**
   * @param {(boolean|undefined)=} expand - Expands the issue if `true`, collapses if `false`, toggles collapse if undefined
   */
  toggle(expand) {
    if (expand === undefined) {
      this.contentElement.classList.toggle('collapsed');
    } else {
      this.contentElement.classList.toggle('collapsed', !expand);
    }
  }

  reveal() {
    this.toggle(true);
    this.contentElement.scrollIntoView(true);
  }

  /**
   * @override
   */
  detach() {
    this._affectedCookiesView.detach();
    super.detach();
  }
}

export class IssuesPaneImpl extends UI.Widget.VBox {
  constructor() {
    super(true);
    this.registerRequiredCSS('issues/issuesPane.css');

    const mainTarget = SDK.SDKModel.TargetManager.instance().mainTarget();
    this._model = null;
    if (mainTarget) {
      this._model = mainTarget.model(SDK.IssuesModel.IssuesModel);
      if (this._model) {
        this._model.addEventListener(SDK.IssuesModel.Events.AggregatedIssueUpdated, this._aggregatedIssueUpdated, this);
        this._model.addEventListener(SDK.IssuesModel.Events.FullUpdateRequired, this._fullUpdate, this);
        this._model.ensureEnabled();
      }
    }

    this._issueViews = new Map();

    const issuesToolbarContainer = this.contentElement.createChild('div', 'issues-toolbar-container');
    new UI.Toolbar.Toolbar('issues-toolbar-left', issuesToolbarContainer);
    const rightToolbar = new UI.Toolbar.Toolbar('issues-toolbar-right', issuesToolbarContainer);
    rightToolbar.appendSeparator();
    const toolbarWarnings = new UI.Toolbar.ToolbarItem(createElement('div'));
    const breakingChangeIcon = UI.Icon.Icon.create('largeicon-breaking-change');
    toolbarWarnings.element.appendChild(breakingChangeIcon);
    this._toolbarIssuesCount = toolbarWarnings.element.createChild('span', 'warnings-count-label');
    this._updateCounts();
    rightToolbar.appendToolbarItem(toolbarWarnings);

    if (this._model) {
      for (const issue of this._model.aggregatedIssues()) {
        this._updateAggregatedIssueView(issue);
      }
    }
  }

  /**
   * @param {!{data: !SDK.Issue.AggregatedIssue}} event
   */
  _aggregatedIssueUpdated(event) {
    const aggregatedIssue = /** @type {!SDK.Issue.AggregatedIssue} */ (event.data);
    this._updateAggregatedIssueView(aggregatedIssue);
  }

  /**
   * @param {!SDK.Issue.AggregatedIssue} aggregatedIssue
   */
  _updateAggregatedIssueView(aggregatedIssue) {
    if (!(aggregatedIssue.code() in issueDetails)) {
      console.warn('Unknown issue code:', aggregatedIssue.code());
      return;
    }
    if (!this._issueViews.has(aggregatedIssue.code())) {
      const view = new AggregatedIssueView(this, aggregatedIssue);
      this._issueViews.set(aggregatedIssue.code(), view);
      view.show(this.contentElement);
    }
    this._issueViews.get(aggregatedIssue.code()).update();
    this._updateCounts();
  }

  _fullUpdate() {
    for (const view of this._issueViews.values()) {
      view.detach();
    }
    this._issueViews.clear();
    for (const aggregatedIssue of this._model.aggregatedIssues()) {
      this._updateAggregatedIssueView(aggregatedIssue);
    }
    this._updateCounts();
  }

  _updateCounts() {
    this._toolbarIssuesCount.textContent = this._model.numberOfAggregatedIssues();
  }

  /**
   * @param {!AggregatedIssueView} issueView
   */
  handleSelect(issueView) {
    issueView.toggle();
  }

  /**
   * @param {string} code
   */
  revealByCode(code) {
    const issueView = this._issueViews.get(code);
    if (issueView) {
      issueView.reveal();
    }
  }
}

/** @enum {symbol} */
export const Priority = {
  High: Symbol('PriorityHigh'),
};

export default IssuesPaneImpl;

const issueDetails = {
  'SameSiteCookies::SameSiteNoneWithoutSecure':
      {title: ls`A Cookie has been set with SameSite=None but without Secure`, message: ls
    `In a future version of chrome, third party cookies will only be sent when marked as SameSite=None and Secure to prevent them from being accessed in a man in the middle scenario.`,
    priority: Priority.High,
    link: ls`https://web.dev/samesite-cookies-explained/`,
    linkTitle: ls`SameSite cookies explained`,
  },
  'SameSiteCookies::SameSiteNoneMissingForThirdParty': {
    title: ls`A Cookie in a third party context has been set without SameSite=None`,
    message: ls
    `In a future version of chrome, third party cookies will only be sent when marked as SameSite=None and Secure to prevent them from being accessed in a man in the middle szenario.`,
    priority: Priority.High,
    link: ls`https://web.dev/samesite-cookies-explained/`,
    linkTitle: ls`SameSite cookies explained`,
  },
  'SameSiteCookieIssue': {
    title: ls`A Cookie in a third party context has been set without SameSite=None`,
    message: ls
    `In a future version of chrome, third party cookies will only be sent when marked as SameSite=None and Secure to prevent them from being accessed in a man in the middle szenario.`,
    priority: Priority.High,
    link: ls`https://web.dev/samesite-cookies-explained/`,
    linkTitle: ls`SameSite cookies explained`,
  },
};
