module.exports = function(grunt) {

	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */'
		},
		concat: {
			plugins: {
				src: ['_scripts/plugins/*.js'],
				dest: '_scripts/plugins.js'
			},
			
			allscripts: {
				src: [ '_scripts/plugins.js','_scripts/main.js'],
				dest: '_scripts/scripts.js'
			},
			iescripts: {
				src: [ '_scripts/libs/nwmatcher.js','_scripts/libs/selectivizr.js','_scripts/libs/respond.js'],
				dest: '_scripts/ie.js'
			}
		},
		min: {
			main: {
				src: '_scripts/main.js',
				dest: '_scripts/main.min.js'
			},
			plugins: {
				src: '_scripts/plugins.js',
				dest: '_scripts/plugins.min.js'
			},
			allscripts: {
				src: ['<banner:meta.banner>', '_scripts/scripts.js'],
				dest: '_scripts/scripts.min.js'
			},
			iescripts: {
				src: '_scripts/ie.js',
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
			},
		},
		watch: {
			files: [
				'_scripts/plugins/*.js',
				'_styles/**/*.less',
				'_scripts/main.js',
				'grunt.js'
			],
			tasks: ['jshint', 'less', 'concat', 'uglify']
		},
		jshint: {
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
				module: false
			}
		},
		uglify: {}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
<<<<<<< HEAD
=======
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');


>>>>>>> 0.4

	// Default task.
	grunt.registerTask('default', 'less concat min');

};