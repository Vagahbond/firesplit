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
    DATABASE_URI=postgres://${config.services.firefly-iii.settings.DB_USERNAME}/${config.services.firefly-iii.settings.DB_DATABASE}?host=/var/run/postgresql
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
        MemoryDenyWriteExecute = true;
        NoNewPrivileges = true;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        ProtectControlGroups = true;
        ProtectKernelModules = true;
        ProtectKernelTunables = true;
        ProtectKernelLogs = true;
        RestrictAddressFamilies = [
          "AF_UNIX"
          "AF_INET"
          "AF_INET6"
        ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        LockPersonality = true;
        SystemCallArchitectures = "native";
      };
      unitConfig.JoinsNamespaceOf = "phpfpm-firefly-iii.service";
      partOf = [ "phpfpm-firefly-iii.service" ];
    };
  };
}
