var gulp = require('gulp');
var print = require('gulp-print');
var wiredep = require('wiredep');
var inject = require('gulp-inject');
var copy = require('gulp-copy');
var flatten = require('gulp-flatten');
var angularFilesort = require('gulp-angular-filesort');
var ngAnnotate = require('gulp-ng-annotate');
var merge = require('merge-stream');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var git = require('gulp-git');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var clean = require('gulp-clean');
var cleancss = require('gulp-clean-css');
var cached = require('gulp-cached');


gulp.task('vendor-scripts', function () {
    var dest = 'src/main/resources/static/js';
    return gulp.src(wiredep().js)
        .pipe(cached("vendor-scripts"))
        .pipe(sourcemaps.init())
        .pipe(concat('alllibs.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(dest));
});

gulp.task('vendor-css', function () {
    var dest = 'src/main/resources/static/css';
    return merge(gulp.src(wiredep().css)
            .pipe(cached("vendor-css")),
        gulp.src(wiredep().less)
            .pipe(cached("vendor-less")).pipe(less())
    )
        .pipe(sourcemaps.init())
        .pipe(concat('alllibs.css'))
        .pipe(cleancss())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest));

});

gulp.task('scripts', function () {
    var dest = 'src/main/resources/static/js';
    return gulp.src("ui-src/js/**/*.js")
        .pipe(ngAnnotate())
        .on('error', swallowError)
        .pipe(angularFilesort())
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(concat('nzbhydra.js'))
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dest));

});

gulp.task('less', function () {
    var dest = 'src/main/resources/static/css';
    var brightTheme = gulp.src('ui-src/less/bright.less')
        .pipe(cached("bright"))
        .pipe(sourcemaps.init())
        .pipe(less())
        //.on('error', swallowError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest));

    var greyTheme = gulp.src('ui-src/less/grey.less')
        .pipe(cached("grey"))
        .pipe(sourcemaps.init())
        .pipe(less())
        //.on('error', swallowError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest));

    var darkTheme = gulp.src('ui-src/less/dark.less')
        .pipe(cached("dark"))
        .pipe(sourcemaps.init())
        .pipe(less())
        //.on('error', swallowError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest));

    return merge(brightTheme, greyTheme, darkTheme);
});

gulp.task('copy-assets', function () {
    var fontDest = 'src/main/resources/static/fonts';
    var fonts1 = gulp.src("bower_components/bootstrap/fonts/*")
        .pipe(cached("fonts1"))
        .pipe(gulp.dest(fontDest));

    var fonts2 = gulp.src("bower_components/font-awesome/fonts/*")
        .pipe(cached("fonts2"))
        .pipe(gulp.dest(fontDest));

    var imgDest = 'src/main/resources/static/img';
    var img = gulp.src("ui-src/img/**/*")
        .pipe(cached("images"))
        .pipe(gulp.dest(imgDest));

    var htmlDest = 'src/main/resources/static/html';
    var html = gulp.src("ui-src/html/**/*")
        .pipe(cached("html"))
        .pipe(gulp.dest(htmlDest));

    return merge(img, html, fonts1, fonts2);
});


gulp.task('add', function () {
    return gulp.src('src/main/resources/static/*')
        .pipe(cached("add"))
        .pipe(git.add({args: '--all'}));
});


gulp.task('reload', function () {
    return gulp.src('src/main/resources/static/index.html')
        .pipe(livereload());
});

gulp.task('delMainLessCache', function () {
    delete cached.caches["bright"];
    delete cached.caches["grey"];
    delete cached.caches["dark"];
});

gulp.task('copyStaticToClasses', function () {
    return gulp.src('src/main/resources/static/**/*')
        .pipe(cached("copyStatic"))
        .pipe(gulp.dest('target/classes/static'));
});

gulp.task('index', function () {
    runSequence(['scripts', 'less', 'vendor-scripts', 'vendor-css', 'copy-assets'], [
        'copyStaticToClasses',
        'add']);
});

function swallowError(error) {

    this.emit('end');
}


gulp.task('default', function () {
    //livereload.listen();
    gulp.watch(['ui-src/less/nzbhydra.less'], ['delMainLessCache']);
    gulp.watch(['ui-src/**/*'], ['index']);
});