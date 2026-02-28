{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.docker
    pkgs.docker-compose
  ];

  services.docker.enable = true;

  env = {};

  idx = {
    extensions = [
      "angular.ng-template"
      "google.gemini-cli-vscode-ide-companion"
    ];

    workspace = {
      onCreate = {
        npm-install = "npm i --no-audit --no-progress --timing";
        default.openFiles = [ "src/app/app.component.ts" ];
      };
    };

    previews = {
      enable = true;

      previews = {
        web = {
          command = [
            "npm" "run" "start" "--"
            "--port" "$PORT"
            "--host" "0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}
