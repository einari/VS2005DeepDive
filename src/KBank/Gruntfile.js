/// <binding AfterBuild='concat, sync' ProjectOpened='karma' />
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        bower: {
            install: {
                options: {
                    targetDir: "wwwroot/lib",
                    layout: "byComponent",
                    cleanTargetDir: false
                }
            }
        },

        jshint: grunt.file.readJSON("jshint.js"),

        concat: {
            css: {
                src: [],
                dest: "wwwroot/styles"
            },
            features: {
                src: [
                    "Features/**/*.js",
                    "Directives/**/*.js"
            ],
                dest: "wwwroot/Features.js"
            },
            infrastructure: {
                src: ["Infrastructure/**/*.js"],
                dest: "wwwroot/Infrastructure.js"
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        autowatch: {
            options: {
                tasks: ["jshint"]
            }
        },

        sync: {
            main: {
                files: [{
                    cwd: "",
                    src: [
                        "*.html",
                        "Features/**/*.html",
                        "Directives/**/*.html"
                    ],
                    dest: "wwwroot"
                }]
            }
        }
    });

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma');
    //grunt.loadNpmTasks('grunt-autowatch');

    grunt.loadNpmTasks('grunt-sync');

    grunt.registerTask("angular_conventions", function () {
        var files = grunt.file.expand({
            cwd: "Features"
        }, ["**/*.html"]);

        var directivesString = "function configureDirectives(application) {\n";

        grunt.file.recurse("Directives", function (absolutePath, rootDir, subDir, filename) {
            if (filename == "View.html") {
                var controller = "Web.Directives." + subDir + ".Controller";
                directivesString += "\tapplication.controller(\"" + controller + "\", " + controller + ");\n";
                directivesString += "\tapplication.directive(\"" + subDir.toLowerCase() + "\", function() {\n\t\treturn {\n\t\t\ttemplateUrl: \"Directives/" + subDir + "/View.html\",\n\t\t\tcontroller: \"" + controller + "\"\n\t\t}\n\t});\n";
            }
        });
        directivesString += "}\n";
        grunt.file.write("wwwroot/directives.js", directivesString);


        var routesString = "function configureRoutes(routeProvider) {\n";
        var controllersString = "function configureControllers(application) {\n";

        files.forEach(function (file) {
            var path = file;
            path = file.substr(0, file.indexOf("."));
            var fullFilePath = "Features/" + file;
            var controller = "Web." + fullFilePath.split("/").join(".").replace(".html", "");

            routesString += "\trouteProvider.when(\"/" + path + "\", { templateUrl: \"" + fullFilePath + "\", controller: \"" + controller + "\" });\n";

            controllersString += "\tapplication.controller(\"" + controller + "\", " + controller + ");\n";
        });

        controllersString += "}\n";
        routesString += "}\n";

        grunt.file.write("wwwroot/routes.js", routesString);
        grunt.file.write("wwwroot/controllers.js", controllersString);
    });




    grunt.registerTask("default", ["bower:install"]);
    grunt.registerTask("default", ["concat:css", "concat:features", "concat:infrastructure"]);

    grunt.registerTask("default", "karma");

    grunt.registerTask("default", "sync");
};