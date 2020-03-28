const gulp        = require('gulp');
const browserSync = require('browser-sync').create();
const sass        = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const postcss_flexbugs = require('postcss-flexbugs-fixes');
const babel = require ('gulp-babel');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const minifyCss = require('gulp-csso');
const rename = require('gulp-rename');
const uglyJs = require('gulp-uglify');
const filter = require ('gulp-filter');
const debug = require ('gulp-debug');


//Load Config File
const config = require('./gulp.config')();
const del = require('del');

//CHILD PROCESS & UTIL FOR JEKYLL
var cp = require ('child_process');
var util = require('gulp-util');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


// Static Server + watching scss/html files
gulp.task('_serve', ['_jekyllBuild'], function() {

    browserSync.init({
        server: "./_site/",
        reloadDelay: 3000
    });

    gulp.watch("scss/*.scss", ['_jekyllReBuild']);
    gulp.watch('./**/*.md', ['_jekyllReBuild']);
    gulp.watch('./**/*.jpg', ['_jekyllReBuild']);
    gulp.watch('./_includes/**/*.html', ['_jekyllReBuild']);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('_styles', ['_jquery', '_bootjs', '_clean-up'], function() {
    var plugins = [
        autoprefixer({browsers: config.bootstrapBrowswerAutoprefixers}),
        postcss_flexbugs()
    ];
    const notMapFilter = filter('**/*.css', {restore: true});
    return gulp.src("scss/app.scss")
        .pipe(sass())
        .pipe(postcss(plugins))
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
//        .pipe(debug({title: 'map: '}))
        .pipe(notMapFilter).on('error', function(e){
            console.log(e);
         })
 //       .pipe(debug({title: 'not map: '}))
        .pipe(rename({suffix: '.min'}))
        .pipe(notMapFilter.restore)
        .pipe(gulp.dest("./css"))
//        .pipe(browserSync.stream());
});

gulp.task('_jekyllReBuild', ['_jekyllBuild'], function() {
    browserSync.reload();
});

gulp.task('_jekyllBuild', ['_styles'], function() {
    util.log ('Run JekyllServe');
    var jekyll = cp.spawn('jekyll', ['serve',
        '--incremental',
        '--detach',
        '--drafts']);
    var jekyllLogger = (buffer) => {
        buffer.toString()
        .split(/\n/)
        .forEach((message) => util.log('Jekyll: ' + message));
    };
});



gulp.task('_jquery', function() {
    return gulp.src('../node_modules/jquery/dist/jquery.slim.min.js')
    .pipe(gulp.dest('./js'))
});


gulp.task('_clean-up', function() {
    return del('css/*.*');
})

gulp.task('_bootjs', () => {
    var options = {
        preserveComments: 'license'
        };
    return gulp.src(config.boostrapSourceJS)
        .pipe(concat('bootstrap.js'))
      //  .pipe(gulp.dest('./js'))
        .pipe(uglyJs(options))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./js'))

});

gulp.task('default', ['_serve']);

