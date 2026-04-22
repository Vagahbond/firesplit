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
        default =
          let
            db = import ./nix/database.nix { inherit pkgs; };
            ff = import ./nix/firefly.nix { inherit pkgs; };
          in
          pkgs.mkShell {
            buildInputs = with db; [
              pkgs.firefly-iii
              pkgs.bun
              pkgs.postgresql
              pgconfigure
              pgstart
              pginit
              pgstop
              pgseed
              pgdump
            ];

            DATABASE_URI = "pg://firefly-iii:firefly-iii@localhost:5432/firefly-iii";
            LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";
            ENVIRONMENT = "development";

            shellHook = ''

              echo "pginit init database"
              echo "pgstart start database"
              echo "pgconfigure create db and user"
              echo "pgdump to dump db in database.sql"

              echo Now developping my homepage!
            '';
          };
      });
    };
}
