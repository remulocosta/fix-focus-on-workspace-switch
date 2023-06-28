/* Workspace Focus Fix
 * 
 * *********** Author ***********
 * Hidden <hidden@undernet.org>
 *
 * ********* Description ********
 * When a workspace switch occurs, this extension ensures the focus
 * is on a window located on the new workspace.
 */

'use strict';
const __DEBUG__ = false;

const GLib = imports.gi.GLib;

function init() {
    // do nothing
}

function enable() {
    global.workspace_manager.connect('workspace-switched', _setFocus);
    log(`WorkspaceFocus enabled`)
}

function disable() {
    global.workspace_manager.disconnect(_setFocus);
    log(`WorkspaceFocus disabled`)

}

function isWindowInNonWorkspace(window) {
    const ret = window.is_on_all_workspaces();
    if (__DEBUG__) {
        if (ret) {
            let workspace = window.get_workspace();
            let windowTitle = "";
            // Get the window actor for the given window
            const windowActor = global.get_window_actors().find(actor => actor.metaWindow === window);

            if (windowActor) {
                // Get the window title from the window actor
                windowTitle = windowActor.get_meta_window().get_title();
            }
            log(`isWindowInNonWorkspace() is true for [${workspace.index()}] ${window.get_id()} - ${windowTitle}`);
        }
    }
    return ret;
}


function _setFocus() {
    const workspace = global.workspace_manager.get_active_workspace();
    const windowList = workspace.list_windows();

    const display = global.display;
    const windowList2 = display.sort_windows_by_stacking(windowList);
    for (let i = windowList2.length - 1; i >= 0; i--) {
        let window = windowList2[i];
        if (window.minimized || isWindowInNonWorkspace(window)) {
            continue;
        }
        if (__DEBUG__) {
            let windowTitle = "";
            // Get the window actor for the given window
            const windowActor = global.get_window_actors().find(actor => actor.metaWindow === window);

            if (windowActor) {
                // Get the window title from the window actor
                windowTitle = windowActor.get_meta_window().get_title();
            }
            log(`Most recent window: [${workspace.index()}] ${window.get_id()} - ${windowTitle}`);
        }
        
        // A delay is required here, otherwise focus is not properly applied to the window
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => (window.activate(global.get_current_time())));
        break;
    }
}

