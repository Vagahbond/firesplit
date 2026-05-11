self:
{

  pkgs,
  lib,
  config,
  ...
}:
let

  cfg = config.services.firefly-iii.firesplit;

  startScript = pkgs.writeShellScriptBin "firesplit.sh" ''
    set -a
    FIREFLY_KEY=$(cat ${config.services.firefly-iii.settings.APP_KEY_FILE})
    DATABASE_URI=postgres://${config.services.firefly-iii.settings.DB_USERNAME}/${config.services.firefly-iii.settings.DB_DATABASE}?host=/var/run/postgresql/.s.PGSQL.5432 
    PORT=${toString cfg.port}


    ${pkgs.bun}/bin/bun ${self.packages.${pkgs.stdenv.system}.default};
  '';

in
{
  options = {
    services.firefly-iii.firesplit = {
      enable = lib.mkEnableOption "Enable the firefly-iii firesplit service";
      port = lib.mkOption {
        type = lib.types.int;
        default = 3000;
        description = "Port to listen on";
      };
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.firesplit = {
      description = "Firefly III Debt Tracker";
      wantedBy = [ "multi-user.target" ];
      after = [
        "network.target"
        "firefly-iii-setup.service"
      ];
      serviceConfig = {
        Type = "simple";
        Restart = "always";
        RestartSec = "10";
        ExecStart = "${startScript}/bin/firesplit.sh";
        WorkingDirectory = self.packages.${pkgs.stdenv.system}.default;
        User = config.services.firefly-iii.user;
        Group = config.services.firefly-iii.group;
        StateDirectory = "firefly-iii";
        ReadWritePaths = [ config.services.firefly-iii.dataDir ];
        PrivateTmp = true;
        PrivateDevices = true;
        CapabilityBoundingSet = "";
        AmbientCapabilities = "";
        ProtectSystem = "strict";
        ProtectKernelTunables = true;
        ProtectKernelModules = true;
        ProtectControlGroups = true;
        ProtectClock = true;
        ProtectHostname = true;
        ProtectHome = "tmpfs";
        ProtectKernelLogs = true;
        ProtectProc = "invisible";
        ProcSubset = "pid";
        PrivateNetwork = false;
        RestrictAddressFamilies = "AF_INET AF_INET6 AF_UNIX";
        SystemCallArchitectures = "native";
        SystemCallFilter = [
          "@system-service @resources"
          "~@obsolete @privileged"
        ];
        RestrictSUIDSGID = true;
        RemoveIPC = true;
        NoNewPrivileges = true;
        RestrictRealtime = true;
        RestrictNamespaces = true;
        LockPersonality = true;
        PrivateUsers = true;
      };
      unitConfig.JoinsNamespaceOf = "phpfpm-firefly-iii.service";
      partOf = [ "phpfpm-firefly-iii.service" ];
    };
  };
}
