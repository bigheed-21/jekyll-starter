var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var svgSymbols  = require('gulp-svg-symbols');
var cssnano     = require('gulp-cssnano');
var imagemin    = require('gulp-imagemin');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(cssnano())
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

/**
    Create an svg sprite system for iconography
*/

gulp.task('svgSymbols', function(){
	return gulp.src('assets/svg/*.svg')
	.pipe(svgSymbols({
		css: false,
        templates: ['default-svg'],
		accessibility: function () {
			return {
				title: false
			}
		},
		className: '.icon-%f'
	}))
	.pipe(gulp.dest('_includes'));
});

/**
    Image optimisation for performance gains
*/

gulp.task('images', function(){
    return gulp.src('assets/**')
    .pipe(imagmin({
        progressive: true
    }))
    .pipe(gulp.dest('_site/assets'));
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/*.scss', ['sass']);
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*', '*.yml', '_includes/*.html'], ['jekyll-rebuild']);
    gulp.watch('assets/svg/*.svg', ['svgSymbols']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
