module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-include-source');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');

  grunt.initConfig({
    babel: {
      options: {
        plugins: ['transform-react-jsx'], // npm install babel-plugin-transform-react-jsx
        presets: ['es2015', 'react'] // npm install babel-preset-es2015 babel-preset-react
      },
      jsx: {
        files: [{
          expand: true,
          cwd: 'js/components',
          src: ['*.jsx'],
          dest: 'dist/js/components/',
          ext: '.js'
        }]
      }
    },

    copy: {
      extention: {
        files: [
          { src: 'src/manifest.json', dest: 'dist/manifest.json' },
          { src: 'js/background.js', dest: 'dist/background.js' },
          { expand: true, src: 'js/*.js', dest: 'dist/' },
          { expand: true, src: 'media/*.mp3', dest: 'dist/' },
          { expand: true, src: 'bower_components/*/**.js', dest: 'dist/' },
        ]
      }
    },

    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['copy'],
        options: {
          spawn: false,
          liveReload: true
        },
      },
    },

    includeSource: {
      options: {
        basePath: '',
        baseUrl: '/',
        templates: {
          html: {
            js: '<script src="{filePath}"></script>',
            css: '<link rel="stylesheet" type="text/css" href="{filePath}" />',
          },
          haml: {
            js: '%script{src: "{filePath}"}/',
            css: '%link{href: "{filePath}", rel: "stylesheet"}/'
          },      
          jade: {
            js: 'script(src="{filePath}", type="text/javascript")',    
            css: 'link(href="{filePath}", rel="stylesheet", type="text/css")'
          },
          scss: {
            scss: '@import "{filePath}";',
            css: '@import "{filePath}";',
          },
          less: {
            less: '@import "{filePath}";',
            css: '@import "{filePath}";',
          },
          ts: {
            ts: '/// <reference path="{filePath}" />'
          }
        }
      },
      myTarget: {
        files: {
          'dist/window.html': 'src/window.tpl.html'
        }
      }
    }
  })

  grunt.registerTask('default', ['babel', 'copy', 'includeSource']);

};