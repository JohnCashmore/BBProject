/*global module */
module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */ <%= "\\n" %>'
		},
		concat: {
			main: {
				src: ['_scripts/main/main.js'],
				dest: '_scripts/dev/main.js'
			},
			plugins: {
				src: ['_scripts/plugins/*.js'],
				dest: '_scripts/dev/plugins.js'
			},
			allscripts: {
				src: [ '_scripts/dev/plugins.js','_scripts/dev/main.js'],
				dest: '_scripts/dev/scripts.js'
			},
			iescripts: {
				src: [ '_scripts/libs/nwmatcher.js','_scripts/libs/selectivizr.js','_scripts/libs/respond.js'],
				dest: '_scripts/dev/ie.js'

			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			allscripts: {
				src:  '_scripts/dev/scripts.js',
				dest: '_scripts/scripts.min.js'
			},
			iescripts: {
				src: '_scripts/dev/ie.js',
				dest: '_scripts/ie.min.js'
			}
		},
		less: {
			main: {
				options: {
					yuicompress: false
				},
				files: {
					'_styles/main.css': '_styles/less/_order.less'
				}
			},
			fonts: {
				options: {
					yuicompress: false
				},
				files: {
					'_styles/fonts.css': '_styles/less/fonts.less'
				}
			},
			mainMin: {
				options: {
					yuicompress: true
				},
				files: {
					'_styles/main.min.css': '_styles/less/_order.less'
				}
			},
			fontsMin: {
				options: {
					yuicompress: true
				},
				files: {
					'_styles/fonts.min.css': '_styles/less/fonts.less'
				}
			}
		},
		watch: {
			files: [
				'_scripts/plugins/*.js',
				'_styles/**/*.less',
				'_scripts/main/main.js',
				'grunt.js'
			],
			tasks: ['jshint', 'less', 'concat', 'uglify']
		},
		// You may wish to trun this off if your having issues fixing the js problems
		jshint: {
			all: [
			'_scripts/main/main.js',
			'Gruntfile.js'
			],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true
			},
			globals: {
				exports: true,
				module: false,
				jQuery: false,
				$:false
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');



	// Default task.
	grunt.registerTask('default', ['jshint', 'less', 'concat', 'uglify']);

};
