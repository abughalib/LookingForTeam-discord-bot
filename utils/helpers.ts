import { SystemTrafficInfo } from "./models";
import { AppSettings } from "./settings";

function formatTime(duration: number): string {
  // Added for cameld00d
  if (duration < 0) {
    return "For few hours maybe";
  }

  // Duration less then 1 i.e minutes
  if (duration < 1) {
    duration = 60 * duration;
    if (duration < 1) {
      return `${Math.floor(duration * 60)} seconds`;
    }
    return `About ${Math.floor(duration)} Minutes`;
  }
  let str_duration = duration.toString();

  if (str_duration.includes(".")) {
    const duration_split = str_duration.split(".");
    const hours = duration_split[0];
    const minutes = Math.ceil(parseFloat("." + duration_split[1]) * 60);
    return `About ${hours} hours and ${minutes} Minutes`;
  }

  return `About ${duration} Hours`;
}

interface ShipsInfo {
  shipNames: Array<string>;
  shipCount: Array<string>;
}

function getEliteShipAndCount(systemTrafficInfo: SystemTrafficInfo): ShipsInfo {
  let shipNames: string[] = [];
  let shipCount: string[] = [];

  if (systemTrafficInfo.breakdown !== null) {
    if (
      systemTrafficInfo.breakdown.Addar !== null &&
      systemTrafficInfo.breakdown.Addar > 0
    ) {
      shipNames.push("Addar");
      shipCount.push(systemTrafficInfo.breakdown.Addar.toString());
    }
    if (
      systemTrafficInfo.breakdown.Anaconda !== null &&
      systemTrafficInfo.breakdown.Anaconda > 0
    ) {
      shipNames.push("Anaconda");
      shipCount.push(systemTrafficInfo.breakdown.Anaconda.toString());
    }
    if (
      systemTrafficInfo.breakdown["Asp Explorer"] !== null &&
      systemTrafficInfo.breakdown["Asp Explorer"] > 0
    ) {
      shipNames.push("Asp Explorer");
      shipCount.push(systemTrafficInfo.breakdown["Asp Explorer"].toString());
    }

    if (
      systemTrafficInfo.breakdown["Beluga Liner"] !== null &&
      systemTrafficInfo.breakdown["Beluga Liner"] > 0
    ) {
      shipNames.push("Beluga Liner");
      shipCount.push(systemTrafficInfo.breakdown["Beluga Liner"].toString());
    }

    if (
      systemTrafficInfo.breakdown["Cobra MkIII"] !== null &&
      systemTrafficInfo.breakdown["Cobra MkIII"] > 0
    ) {
      shipNames.push("Cobra MkIII");
      shipCount.push(systemTrafficInfo.breakdown["Cobra MkIII"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Diamondback Explorer"] !== null &&
      systemTrafficInfo.breakdown["Diamondback Explorer"] > 0
    ) {
      shipNames.push("Diamondback Explorer");
      shipCount.push(
        systemTrafficInfo.breakdown["Diamondback Explorer"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown.Dolphin !== null &&
      systemTrafficInfo.breakdown.Dolphin > 0
    ) {
      shipNames.push("Dolphin");
      shipCount.push(systemTrafficInfo.breakdown.Dolphin.toString());
    }
    if (
      systemTrafficInfo.breakdown["Federal Assault Ship"] !== null &&
      systemTrafficInfo.breakdown["Federal Assault Ship"] > 0
    ) {
      shipNames.push("Federal Assault Ship");
      shipCount.push(
        systemTrafficInfo.breakdown["Federal Assault Ship"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Federal Corvette"] !== null &&
      systemTrafficInfo.breakdown["Federal Corvette"] > 0
    ) {
      shipNames.push("Federal Corvette");
      shipCount.push(
        systemTrafficInfo.breakdown["Federal Corvette"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Federal Gunship"] !== null &&
      systemTrafficInfo.breakdown["Federal Gunship"] > 0
    ) {
      shipNames.push("Federal Gunship");
      shipCount.push(systemTrafficInfo.breakdown["Federal Gunship"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Fer-de-Lance"] !== null &&
      systemTrafficInfo.breakdown["Fer-de-Lance"] > 0
    ) {
      shipNames.push("Fer-de-Lance");
      shipCount.push(systemTrafficInfo.breakdown["Fer-de-Lance"].toString());
    }
    if (
      systemTrafficInfo.breakdown.Hauler !== null &&
      systemTrafficInfo.breakdown.Hauler > 0
    ) {
      shipNames.push("Hauler");
      shipCount.push(systemTrafficInfo.breakdown.Hauler.toString());
    }
    if (
      systemTrafficInfo.breakdown["Imperial Clipper"] !== null &&
      systemTrafficInfo.breakdown["Imperial Clipper"] > 0
    ) {
      shipNames.push("Imperial Clipper");
      shipCount.push(
        systemTrafficInfo.breakdown["Imperial Clipper"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Imperial Courier"] !== null &&
      systemTrafficInfo.breakdown["Imperial Courier"] > 0
    ) {
      shipNames.push("Imperial Courier");
      shipCount.push(
        systemTrafficInfo.breakdown["Imperial Courier"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Imperial Cutter"] !== null &&
      systemTrafficInfo.breakdown["Imperial Cutter"] > 0
    ) {
      shipNames.push("Imperial Cutter");
      shipCount.push(systemTrafficInfo.breakdown["Imperial Cutter"].toString());
    }
    if (
      systemTrafficInfo.breakdown.Orca !== null &&
      systemTrafficInfo.breakdown.Orca > 0
    ) {
      shipNames.push("Orca");
      shipCount.push(systemTrafficInfo.breakdown.Orca.toString());
    }
    if (
      systemTrafficInfo.breakdown.Python !== null &&
      systemTrafficInfo.breakdown.Python > 0
    ) {
      shipNames.push("Python");
      shipCount.push(systemTrafficInfo.breakdown.Python.toString());
    }
    if (
      systemTrafficInfo.breakdown["Type-9 Heavy"] !== null &&
      systemTrafficInfo.breakdown["Type-9 Heavy"] > 0
    ) {
      shipNames.push("Type-9 Heavy");
      shipCount.push(systemTrafficInfo.breakdown["Type-9 Heavy"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Viper MkIII"] !== null &&
      systemTrafficInfo.breakdown["Viper MkIII"] > 0
    ) {
      shipNames.push("Viper MkIII");
      shipCount.push(systemTrafficInfo.breakdown["Viper MkIII"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Viper MkIV"] !== null &&
      systemTrafficInfo.breakdown["Viper MkIV"] > 0
    ) {
      shipNames.push("Viper MkIV");
      shipCount.push(systemTrafficInfo.breakdown["Viper MkIV"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Vulture"] !== null &&
      systemTrafficInfo.breakdown["Vulture"] > 0
    ) {
      shipNames.push("Vulture");
      shipCount.push(systemTrafficInfo.breakdown["Vulture"].toString());
    }
  }

  return {
    shipNames,
    shipCount,
  };
}

enum DurationValidation {
  VALID,
  INVALID,
  LIMIT_EXCEEDED,
}

function checkDurationValidation(duration: number): DurationValidation {
  if (duration < 0) {
    return DurationValidation.INVALID;
  }
  if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
    return DurationValidation.LIMIT_EXCEEDED;
  }

  return DurationValidation.VALID;
}

function removeEntry(arri: Array<string>, leavingUser: string) {
  let array: Array<string> = [];

  for (let i = 0; i < arri.length; i += 1) {
    if (arri[i] !== leavingUser) {
      array.push(arri[i]);
    }
  }

  return array;
}

export {
  formatTime,
  getEliteShipAndCount,
  removeEntry,
  checkDurationValidation,
  DurationValidation,
};
