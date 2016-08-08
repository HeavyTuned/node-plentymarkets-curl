module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			files: ['plentymarkets.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('test', ['jshint']);
};