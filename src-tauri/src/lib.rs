use tauri::Manager;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
};

#[tauri::command]
fn resize_window(app: tauri::AppHandle, width: f64, height: f64) {
    if let Some(window) = app.get_webview_window("main") {
        window.set_size(tauri::Size::Logical(tauri::LogicalSize { width, height })).unwrap();
    }
}

pub fn run() {
    tauri::Builder::default()
      // This is required to get tray-relative positions to work
      .setup(|app| {
          #[cfg(desktop)]
          {
            let quit_i = MenuItem::with_id(app, "quit", "Quit Pomonotch", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            app.handle().plugin(tauri_plugin_positioner::init());
            let tray = tauri::tray::TrayIconBuilder::new()
              .menu(&menu)
              .on_menu_event(|app, event| match event.id.as_ref() {
                "quit" => {
                  println!("quit menu item was clicked");
                  app.exit(0);
                }
                _ => {
                  println!("menu item {:?} not handled", event.id);
                }
              })
              .menu_on_left_click(true)
              .icon(app.default_window_icon().unwrap().clone())
              .on_tray_icon_event(|tray_handle, event| {
                tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);
              })
              .build(app)?;
          }
        Ok(())
      })
      .invoke_handler(tauri::generate_handler![resize_window])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}