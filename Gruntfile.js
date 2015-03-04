// Gruntfile.js
// v1.0.0

module.exports = function(grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
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
    watch: {
      styles: {
        files: ['_working/www/css/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask('default', ['less', 'watch']);
};