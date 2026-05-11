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
    DATABASE_URI='postgres://${config.services.firefly-iii.settings.DB_USERNAME}/${config.services.firefly-iii.settings.DB_DATABASE}?host=/run/postgresql'
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
    services.nginx.virtualHosts = lib.mkIf config.services.firefly-iii.enableNginx {
      ${config.services.firefly-iii.virtualHost} = {
        locations = {
          "/split" = {
            proxyPass = "http://127.0.0.1:${toString cfg.port}";
            proxyWebsockets = true;
            extraConfig = ''
              rewrite ^/split/?([^/]*)$ /$1 break;
            '';
          };
        };
      };
    };

    systemd.services.firesplit = {
      description = "Firesplit, a Firefly III Debt Tracker";

      wantedBy = [ "multi-user.target" ];

      after = [
        "network.target"
        "firefly-iii-setup.service"
      ];

      requires = [
        "postgresql.service"
      ];

      serviceConfig = {
        Type = "simple";
        Restart = "on-failure";
        RestartSec = "10";
        ExecStart = "${startScript}/bin/firesplit.sh";

        WorkingDirectory = self.packages.${pkgs.stdenv.system}.default;

        User = config.services.firefly-iii.user;
        Group = config.services.firefly-iii.group;

        AmbientCapabilities = [ ];
        CapabilityBoundingSet = [ ];
        LockPersonality = true;
        MemoryDenyWriteExecute = true;
        NoNewPrivileges = true;
        PrivateMounts = true;
        PrivateTmp = true;
        PrivateUsers = false;
        ProcSubset = "pid";
        ProtectClock = true;
        ProtectControlGroups = true;
        ProtectHome = true;
        ProtectHostname = true;
        ProtectKernelLogs = true;
        ProtectKernelModules = true;
        ProtectKernelTunables = true;
        ProtectProc = "invisible";
        ProtectSystem = "strict";
        RestrictAddressFamilies = [
          "AF_INET"
          "AF_INET6"
          "AF_NETLINK"
          "AF_UNIX"
        ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        SystemCallArchitectures = "native";
        SystemCallFilter = "@system-service";
        UMask = "077";

      };
      # unitConfig.JoinsNamespaceOf = "phpfpm-firefly-iii.service";
      # partOf = [ "phpfpm-firefly-iii.service" ];
    };
  };
}
