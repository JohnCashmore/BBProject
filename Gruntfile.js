/*global module */
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */ <%= "\\n" %>'
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
			ie: {
				options: {
					yuicompress: false
				},
				files: {
					'_styles/ie.css': '_styles/less/_order.less'
				}
			}
		},
		cmq: {
			main: {
				files: {
					'_styles/': '_styles/main.css'
				}
			},
			ie: {
				files: {
					'_styles/': '_styles/ie.css'
				}
			}
		},
		"comment-media-queries": {
			options: {
				// Task-specific options go here.
			},
			ie: {
				files: {
					'_styles/ie.css': '_styles/ie.css'
				}
			}
		},
		cssmin: {
			main: {
				src: '_styles/main.css',
				dest: '_styles/main.min.css'
			},
			fonts: {
				src: '_styles/fonts.css',
				dest: '_styles/fonts.min.css'
			},
			ie: {
				src: '_styles/ie.css',
				dest: '_styles/ie.min.css'
			}
		},
		concat: {
			main: {
				src: ['_scripts/main/main.js'],
				dest: '_scripts/_debug/main.js'
			},
			plugins: {
				src: ['_scripts/plugins/*.js'],
				dest: '_scripts/_debug/plugins.js'
			},
			allscripts: {
				src: ['_scripts/_debug/plugins.js', '_scripts/_debug/main.js'],
				dest: '_scripts/_debug/scripts.js'
			},
			iescripts: {
				src: ['_scripts/vendor/nwmatcher.js', '_scripts/vendor/selectivizr.js'],
				dest: '_scripts/_debug/ie.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			allscripts: {
				src: '_scripts/_debug/scripts.js',
				dest: '_scripts/scripts.min.js'
			},
			iescripts: {
				src: '_scripts/_debug/ie.js',
				dest: '_scripts/ie.min.js'
			}
		},
		watch: {
			files: ['_scripts/plugins/*.js', '_styles/**/*.less', '_scripts/main/*.js', 'grunt.js'],
			tasks: ['jshint', 'concat', 'uglify', 'less', 'cmq', 'comment-media-queries', 'cssmin']
		},
		jshint: {
			all: ['_scripts/main/main.js', 'Gruntfile.js'],
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
				$: false
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-comment-media-queries');
	grunt.loadNpmTasks('grunt-combine-media-queries');
	// Default task.
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less', 'cmq', 'comment-media-queries', 'cssmin']);
};