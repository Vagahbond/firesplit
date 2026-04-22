{
  pkgs,
  lib,
  buildNpmPackage,
}:
let
  db = import ./database.nix { inherit pkgs; };

in
buildNpmPackage {
  name = "firefly-debt-tracker";
  src = ../.;
  # Does not matter as Payload is only ran durign build
  PAYLOAD_SECRET = "YOUR_SECRET_HERE";
  DATABASE_URI = "pg://firefly-iii:firefly-iii@localhost:5432/firefly-iii";

  nativeBuildInputs = with db; [
    pkgs.postgresql
    pgconfigure
    pgstart
    pginit
    pgstop
    pgseed
  ];

  # buildPhase = ''
  #   pginit
  #   pgstart
  #   pgconfigure
  #   pgseed
  #
  #   npm --workspace backend run dev &
  #
  #   npm run build
  #
  #   kill %1
  #
  #   mkdir -p $out
  #   cp -r ./build/* $out
  # '';

  packageJSON = ../package.json;
  packageLock = ../package-lock.json;
  npmDepsHash = "sha256-VduqM27MAgEQEPpKCByOqTabuowyNLpNiKAYd5CmJBE=";
}
