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
    FIREFLY_KEY=$(cat ${config.services.firefly-iii.settings.APP_KEY_FILE});
    DATABASE_URI=postgres://${config.services.firefly-iii.settings.DB_USERNAME}@/${config.services.firefly-iii.settings.DB_DATABASE};
    PORT=${toString cfg.port};


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
      };
    };
  };
}
