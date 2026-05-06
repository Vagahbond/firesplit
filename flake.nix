{
  description = "Firefly Debt Tracker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
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
        default = pkgs.callPackage ./nix/package.nix { };
      });

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
              pkgs.simple-http-server
            ];

          DATABASE_URI = "pg://firefly-iii:firefly-iii@localhost:5432/firefly-iii";
          LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";
          ENVIRONMENT = "development";

          shellHook = ''
            echo Now developping my firefly debt plugin!
          '';
        };
      });
    };
}
