import { AlarmManager, ControllerStateManager, SidebarNavManager } from '../../controllers/socket';
import { EnergyManager } from '../../controllers/socket/energy.region/energy.manager';
import { TemperatureManager } from '../../controllers/socket/temperature.region/temperature.manager';
import { Region } from '../../types/db';

export class RegionNotifyManager {
  static #notifyUpdateToSidebarNav(curRegion: Region, fieldsUpdate: Partial<Region>) {
    const { region } = fieldsUpdate;
    if (region !== undefined && curRegion.region !== region) {
      SidebarNavManager.notifyUpdateRegion(curRegion.rgn_id);
    }
  }

  static #notifyUpdateToControllerState(curRegion: Region, fieldsUpdate: Partial<Region>) {
    const { region } = fieldsUpdate;
    if (region !== undefined && curRegion.region !== region) {
      ControllerStateManager.notifyUpdateRegion(curRegion.rgn_id);
    }
  }

  static #notifyUpdateToAlarm(curRegion: Region, fieldsUpdate: Partial<Region>) {
    const { region, descripcion } = fieldsUpdate;
    const hasChanges = (region !== undefined && curRegion.region !== region) || (descripcion !== undefined && curRegion.descripcion !== descripcion);
    if (hasChanges) {
      AlarmManager.notifyRegion(curRegion.rgn_id, 'update');
      TemperatureManager.notifyRegion(curRegion.rgn_id, 'update');
      EnergyManager.notifyRegion(curRegion.rgn_id, 'update');
    }
  }

  static update(curRegion: Region, fieldsUpdate: Partial<Region>) {
    // sidebar_nav
    RegionNotifyManager.#notifyUpdateToSidebarNav(curRegion, fieldsUpdate);

    // ControllerState
    RegionNotifyManager.#notifyUpdateToControllerState(curRegion, fieldsUpdate);

    // Alarm:
    RegionNotifyManager.#notifyUpdateToAlarm(curRegion, fieldsUpdate);
  }

  static add(newRegion: Region) {
    // Alarm:
    AlarmManager.notifyRegion(newRegion.rgn_id, 'add');
    TemperatureManager.notifyRegion(newRegion.rgn_id, 'add');
    EnergyManager.notifyRegion(newRegion.rgn_id, 'add');
  }
}
