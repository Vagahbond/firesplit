{
  pkgs,
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

  packageJSON = ../package.json;
  packageLock = ../package-lock.json;
  npmDepsHash = "sha256-VduqM27MAgEQEPpKCByOqTabuowyNLpNiKAYd5CmJBE=";
}
