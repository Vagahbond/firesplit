{ pkgs }:
{

  firefly-start = pkgs.writeShellScriptBin "firefly-start" ''
    ${pkgs.firefly-iii}/bin/firefly-iii start
  '';
}
