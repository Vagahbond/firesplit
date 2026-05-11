{
  description = "Firefly Debt Tracker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
      # inputs.systems.follows = "systems";
    };
  };

  outputs =
    {
      nixpkgs,
      self,
      ...
    }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs
          [
            "x86_64-linux"
            "aarch64-darwin" # Imagine nixing a mac
          ]
          (
            system:
            function (
              import nixpkgs {
                inherit system;
                config.allowUnfree = true;
              }
            )
          );
    in
    {

      packages = forAllSystems (pkgs: {
        default = pkgs.callPackage ./nix/package.nix {
          bun2nix = self.inputs.bun2nix.packages.${pkgs.stdenv.system}.default;
        };
      });

      nixosModules = {
        default = import ./nix/module.nix self;
      };

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          buildInputs =
            let
              database = import ./nix/database.nix {
                inherit pkgs;
                project = "firefly-iii";
              };
            in
            with database;
            [
              pkgs.postgresql
              pgconfigure
              pgstart
              pginit
              pgseed
              pgstop
              pgdump
              pkgs.bun
            ];

          ENVIRONMENT = "development";
          DATABASE_URI = "postgres://localhost:5432/firefly-iii";

          shellHook = ''
            echo Now developping my firefly debt plugin!
          '';
        };
      });
    };
}
