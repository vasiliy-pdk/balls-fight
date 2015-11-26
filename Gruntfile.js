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

    clean: ['build/scripts/*'],

    concat: {
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
          // @TODO: I did not expected that PC imports all the repo from github. So it's better to keep in
          // build/scripts just concated code for all dependencies
          {expand: true, cwd: 'client/pc.scripts/', src: ['*'], dest: 'build/scripts/', filter: 'isFile'}
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
