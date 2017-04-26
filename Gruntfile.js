module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			options: {
				esversion: 6
			},
			files: ['plentymarkets.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('test', ['jshint']);
};