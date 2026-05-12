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
    PORT=${toString cfg.port}
    ROOT_URL=${cfg.rootUrl}
    set +a


    ${pkgs.postgresql}/bin/psql $DATABASE_URI -c "SELECT 1"

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

      rootUrl = lib.mkOption {
        type = lib.types.str;
        default = "https://${config.services.firefly-iii.virtualHost}/split";
        description = "The root url to use for the application";
      };
    };
  };

  config = lib.mkIf cfg.enable {
    services.nginx.virtualHosts = lib.mkIf config.services.firefly-iii.enableNginx {
      ${config.services.firefly-iii.virtualHost} = {
        locations = {
          "/" = {
            extraConfig = ''
              sub_filter_once on;
              sub_filter '<ul class="sidebar-menu tree" data-widget="tree">' '<ul class="sidebar-menu tree" data-widget="tree"><li>
            <a href="https://money.vagahbond.com/split" class="logout-link">
                <em class="fa fa-code-fork fa-fw"></em>
                <span>Firesplit
                </span>
            </a>
        </li>'
          '';

          "/split/" = {
            proxyPass = "http://127.0.0.1:${toString cfg.port}/";
            proxyWebsockets = true;

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
