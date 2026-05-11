{
  pkgs,
  stdenv,
  bun2nix,
  ...
}:
bun2nix.mkDerivation {
  pname = "firesplit";
  version = "0.0.1";

  src = ../.;

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };

  buildPhase = ''
    bun run build;
  '';

  installPhase = ''
    mkdir -p $out

    cp -R ./dist/* $out/
  '';
}
