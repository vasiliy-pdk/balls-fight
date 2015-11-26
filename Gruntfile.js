module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['Gruntfile.js',
        'client/pc.scripts/*.js',
        'client/src/**/*.js',
        'common/**/*.js',
        'server/**/*.js',
        'test/**/*.js'
      ],
      options: {
        globals: {
          _: true,
          Game: true,
          pc: true
        }
      }
    },

    clean: ['build/balls-fight/*', 'build/scripts/*'],

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        //separator: ';\n'
      },
      //libs: {
      //  src: ['client/libs/**/*.js'],
      //  dest: ['build/scripts/all-libs.js']
      //},
      dist: {
        // the files to concatenate
        src: [
          'client/libs/**/*.js',
          'client/src/Game.js',
          'client/src/GameState.js',
          'client/src/GameMultiplayer.js'
        ],
        // the location of the resulting JS file
        dest: 'build/scripts/<%= pkg.name %>.js'
      }
    },

    copy: {
      options: {
        mode: true
      },

      main: {
        files: [
          {expand: true, cwd: 'client/pc.scripts/', src: ['*'], dest: 'build/scripts/', filter: 'isFile'},
          {src: 'bin/localserver', dest: 'build/scripts/localserver'}
        ]
      },

      project: {
        files: [
          {expand: true, cwd: 'client/pc.project/', src: ['**'], dest: 'build/balls-fight/'},
          {expand: true, cwd: 'build/scripts/', src: ['*', '!localserver'], dest: 'build/balls-fight/', filter: 'isFile'}
        ]
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['build']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['jshint', 'clean', 'concat', 'copy']);
  grunt.registerTask('default', ['build', 'watch']);

};
