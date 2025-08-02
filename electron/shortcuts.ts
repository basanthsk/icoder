import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"
import { configHelper } from "./ConfigHelper"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  private adjustOpacity(delta: number): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    let currentOpacity = mainWindow.getOpacity();
    let newOpacity = Math.max(0.1, Math.min(1.0, currentOpacity + delta));
    console.log(`Adjusting opacity from ${currentOpacity} to ${newOpacity}`);
    
    mainWindow.setOpacity(newOpacity);
    
    // Save the opacity setting to config without re-initializing the client
    try {
      const config = configHelper.loadConfig();
      config.opacity = newOpacity;
      configHelper.saveConfig(config);
    } catch (error) {
      console.error('Error saving opacity to config:', error);
    }
    
    // If we're making the window visible, also make sure it's shown and interaction is enabled
    if (newOpacity > 0.1 && !this.deps.isVisible()) {
      this.deps.toggleMainWindow();
    }
  }

  public registerGlobalShortcuts(): void {
    console.log("🎮 Registering global shortcuts...")
    
    // Primary screenshot shortcut
    globalShortcut.register("CommandOrControl+F2", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        console.log("Command/Ctrl + F2 pressed. Taking screenshot...")
        try {
          const screenshotPath = await this.deps.takeScreenshot()
          const preview = await this.deps.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    // Alternative screenshot shortcut
    globalShortcut.register("F12", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        console.log("F12 pressed. Taking screenshot...")
        try {
          const screenshotPath = await this.deps.takeScreenshot()
          const preview = await this.deps.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    // Ctrl+H screenshot shortcut (alternative to F12 and Ctrl+F2)
    const ctrlHRegistered = globalShortcut.register("CommandOrControl+H", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        console.log("🔥 Command/Ctrl + H pressed. Taking screenshot...")
        try {
          const screenshotPath = await this.deps.takeScreenshot()
          const preview = await this.deps.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })
    
    if (ctrlHRegistered) {
      console.log("✅ Ctrl+H screenshot shortcut registered successfully")
    } else {
      console.error("❌ Failed to register Ctrl+H shortcut - might be already in use by another app")
      console.log("💡 Trying alternative: Ctrl+Shift+H...")
      
      // Try Ctrl+Shift+H as alternative
      const ctrlShiftHRegistered = globalShortcut.register("CommandOrControl+Shift+H", async () => {
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow) {
          console.log("🔥 Command/Ctrl + Shift + H pressed. Taking screenshot...")
          try {
            const screenshotPath = await this.deps.takeScreenshot()
            const preview = await this.deps.getImagePreview(screenshotPath)
            mainWindow.webContents.send("screenshot-taken", {
              path: screenshotPath,
              preview
            })
          } catch (error) {
            console.error("Error capturing screenshot:", error)
          }
        }
      })
      
      if (ctrlShiftHRegistered) {
        console.log("✅ Ctrl+Shift+H screenshot shortcut registered as alternative")
      } else {
        console.error("❌ Failed to register Ctrl+Shift+H shortcut as well")
      }
    }

    globalShortcut.register("CommandOrControl+Enter", async () => {
      console.log("Command/Ctrl + Enter pressed. Processing screenshots...")
      await this.deps.processingHelper?.processScreenshots()
    })

    globalShortcut.register("CommandOrControl+R", () => {
      console.log(
        "Command/Ctrl + R pressed. Canceling requests and resetting queues..."
      )

      // Cancel ongoing API requests
      this.deps.processingHelper?.cancelOngoingRequests()

      // Clear both screenshot queues
      this.deps.clearQueues()

      console.log("Cleared queues.")

      // Update the view state to 'queue'
      this.deps.setView("queue")

      // Notify renderer process to switch view to 'queue'
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("reset-view")
        mainWindow.webContents.send("reset")
      }
    })

    // New shortcuts for moving the window
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.deps.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.deps.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.deps.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.deps.moveWindowUp()
    })

    globalShortcut.register("CommandOrControl+B", () => {
      console.log("Command/Ctrl + B pressed. Toggling window visibility.")
      this.deps.toggleMainWindow()
    })

    globalShortcut.register("CommandOrControl+Q", () => {
      console.log("Command/Ctrl + Q pressed. Quitting application.")
      
      // Unregister all global shortcuts first
      globalShortcut.unregisterAll()
      
      // Get main window and close it properly
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.removeAllListeners()
        mainWindow.close()
      }
      
      // Force quit the app
      app.quit()
      
      // In development mode, also kill the process if quit doesn't work
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          process.exit(0)
        }, 1000)
      }
    })

    // Adjust opacity shortcuts
    globalShortcut.register("CommandOrControl+[", () => {
      console.log("Command/Ctrl + [ pressed. Decreasing opacity.")
      this.adjustOpacity(-0.1)
    })

    globalShortcut.register("CommandOrControl+]", () => {
      console.log("Command/Ctrl + ] pressed. Increasing opacity.")
      this.adjustOpacity(0.1)
    })
    
    // Zoom controls
    globalShortcut.register("CommandOrControl+-", () => {
      console.log("Command/Ctrl + - pressed. Zooming out.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomLevel()
        mainWindow.webContents.setZoomLevel(currentZoom - 0.5)
      }
    })
    
    globalShortcut.register("CommandOrControl+0", () => {
      console.log("Command/Ctrl + 0 pressed. Resetting zoom.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.setZoomLevel(0)
      }
    })
    
    globalShortcut.register("CommandOrControl+=", () => {
      console.log("Command/Ctrl + = pressed. Zooming in.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomLevel()
        mainWindow.webContents.setZoomLevel(currentZoom + 0.5)
      }
    })
    
    // Delete last screenshot shortcut
    globalShortcut.register("CommandOrControl+L", () => {
      console.log("Command/Ctrl + L pressed. Deleting last screenshot.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        // Send an event to the renderer to delete the last screenshot
        mainWindow.webContents.send("delete-last-screenshot")
      }
    })
    
    console.log("✅ Global shortcuts registered successfully!")
    console.log("📋 Available shortcuts:")
    console.log("   Ctrl+F2 / F12 / Ctrl+H: Take screenshot")
    console.log("   Ctrl+Enter: Process screenshots")
    console.log("   Ctrl+R: Reset queues")
    console.log("   Ctrl+B: Toggle window")
    console.log("   Ctrl+Q: Quit app")
    console.log("   Ctrl+[/]: Adjust opacity")
    console.log("   Ctrl+Arrow: Move window")
    console.log("   Ctrl+L: Delete last screenshot")
    
    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      console.log("🎮 Unregistering all global shortcuts...")
      globalShortcut.unregisterAll()
    })
  }
}
