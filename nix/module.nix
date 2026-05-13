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
        extraConfig = ''
          sub_filter_types text/html;
          sub_filter_once off;
          sub_filter '</body>' '
            <a href="/split/" style="
              position: fixed;
              bottom: 16px;
              right: 16px;
              z-index: 99999;
              padding: 8px 16px;
              background: #1a1f35;
              color: #e0def4;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">Split Expenses</a>
          </body>';
        '';
        locations = {
          "/split/" = {
            proxyPass = "http://127.0.0.1:${toString cfg.port}/";
            proxyWebsockets = true;
          };
          "~ \\.php$".extraConfig = lib.mkAfter ''
            fastcgi_param HTTP_ACCEPT_ENCODING "";
          '';
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
