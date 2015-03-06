// Gruntfile.js
// v1.0.0

module.exports = function(grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),
  	concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['_working/www/js/**/*.js'],
        dest: '_working/www/js/compiled.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '_build/www/js/core.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', '_working/**/*.html', '_working/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "_build/www/css/style.css": "_working/www/css/style.less" // destination file and source file
        }
      }
    },
    copy: {
    	main: {
    		files: [
    			//copy root HTML
    			{ expand: true, cwd: '_working/www/', src: ['*.html'], dest: '_build/www/'},
    			//copy images
    			{ expand: true, cwd: '_working/www/img/', src: ['**'], dest: '_build/www/img/'},
    			//copy fonts
    			{ expand: true, cwd: '_working/www/fonts/', src: ['**'], dest: '_build/www/fonts/'}
    		]
    	}
    },
    web_server: {
		options: {
			cors: true,
			port: 8001,
			nevercache: true,
			logRequests: true
		},
		foo: 'bar' // For some reason an extra key with a non-object value is necessary 
	},
    watch: {
      styles: {
        files: ['_working/www/css/**/*.less', '_working/www/**/*.css', '_working/www/**/*.js', '_working/www/**/*.html'], // which files to watch
        tasks: ['less','copy','concat','uglify'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-web-server');


  //grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['concat', 'uglify', 'copy', 'less', 'web_server', 'watch']);
};