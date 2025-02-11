// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Host from '../../core/host/host.js';
import {assertNotNullOrUndefined} from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import {createTarget, stubNoopSettings} from '../../testing/EnvironmentHelpers.js';
import {
  describeWithMockConnection,
} from '../../testing/MockConnection.js';
import {describeWithRealConnection} from '../../testing/RealConnection.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';

import * as Main from './main.js';

describeWithMockConnection('MainMenuItem', () => {
  const focusDebuggee = (targetFactory: () => SDK.Target.Target) => {
    beforeEach(async () => {
      stubNoopSettings();
      sinon.stub(UI.ShortcutRegistry.ShortcutRegistry, 'instance').returns({
        shortcutTitleForAction: () => {},
        shortcutsForAction: () => [],
      } as unknown as UI.ShortcutRegistry.ShortcutRegistry);
      targetFactory();

      sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'hasAction')
          .withArgs(sinon.match(/inspector-main.focus-debuggee|main.toggle-drawer/))
          .returns(true);
      sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'getAction')
          .withArgs(sinon.match(/inspector-main.focus-debuggee|main.toggle-drawer/))
          .returns(sinon.createStubInstance(UI.ActionRegistration.Action));
    });

    it('includes focus debuggee item when undocked', async () => {
      UI.DockController.DockController.instance().setDockSide(UI.DockController.DockState.UNDOCKED);

      const item = Main.MainImpl.MainMenuItem.instance({forceNew: true}).item() as UI.Toolbar.ToolbarMenuButton;
      assertNotNullOrUndefined(item);

      const contextMenuShow = sinon.stub(UI.ContextMenu.ContextMenu.prototype, 'show').resolves();
      item.clicked(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }));

      assert.isTrue(contextMenuShow.calledOnce);
      assert.exists(contextMenuShow.thisValues[0].defaultSection().items.find(
          (item: UI.ContextMenu.Item) => item.buildDescriptor().label === 'Focus page'));
    });

    it('does not include focus debuggee item when docked', async () => {
      UI.DockController.DockController.instance().setDockSide(UI.DockController.DockState.BOTTOM);

      const item = Main.MainImpl.MainMenuItem.instance({forceNew: true}).item() as UI.Toolbar.ToolbarMenuButton;
      assertNotNullOrUndefined(item);

      const contextMenuShow = sinon.stub(UI.ContextMenu.ContextMenu.prototype, 'show').resolves();
      item.clicked(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }));

      assert.isTrue(contextMenuShow.calledOnce);
      assert.notExists(contextMenuShow.thisValues[0].defaultSection().items.find(
          (item: UI.ContextMenu.Item) => item.buildDescriptor().label === 'Focus page'));
    });
  };
  describe('without tab target', () => focusDebuggee(() => createTarget()));
  describe('with tab target', () => focusDebuggee(() => {
                                const tabTaget = createTarget({type: SDK.Target.Type.Tab});
                                createTarget({parentTarget: tabTaget, subtype: 'prerender'});
                                return createTarget({parentTarget: tabTaget});
                              }));
});

describeWithRealConnection('MainImpl', () => {
  it('calls fetchColors on ColorThemeChanged', async () => {
    const colorFetchSpy = sinon.spy(ThemeSupport.ThemeSupport, 'fetchColors');

    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.dispatchEventToListeners(
        Host.InspectorFrontendHostAPI.Events.ColorThemeChanged);

    assert.isTrue(colorFetchSpy.called);
  });
});
