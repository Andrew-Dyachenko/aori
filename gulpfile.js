var signature = '                                                               \n' +
    '/*                                                                         \n' +
    '|------------------------------------------------------------------------- \n' +
    '| Distribution info                                                        \n' +
    '|------------------------------------------------------------------------- \n' +
    '|                                                                          \n' +
    '| Author:  Andrew Dyachenko (Front-end developer)                          \n' +
    '| Date:    ' + Date() + '                                                  \n' +
    '| Email2:  north.inhale@gmail.com                                          \n' +
    '| Skype:   tux_will                                                        \n' +
    '|                                                                          \n' +
    '|---------------------------------- Aori --------------------------------- \n' +
    '|                                                                          \n' +
    '*/                                                                         \n' ;

var gulp = require('gulp');
var path = require('path');
var gulpSync = require('gulp-sync')(gulp);
var debug = require('gulp-debug');
var rename = require("gulp-rename");
var symlink = require('gulp-sym');
var clean = require('gulp-clean');
var banner = require('gulp-banner');
var newer = require('gulp-newer');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');

var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var jade = require('gulp-jade');
var file = require('gulp-file');

// a timeout variable
var timer = null;

// actual reload function
function stackReload() {
    var reload_args = arguments;

    // Stop timeout function to run livereload if this function is ran within the last 250ms
    if (timer) clearTimeout(timer);

    // Check if any gulp task is still running
    if (!gulp.isRunning) {
        timer = setTimeout(function() {
            livereload.changed.apply(null, reload_args);
        }, 750);
    }
}


var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete. 
// You should run it at least once to create the icons. Then, 
// you should run it whenever RealFaviconGenerator updates its 
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'assets/images/master-favicon.png',
        dest: 'assets/images/favicons/',
        iconsPath: 'dist/images/favicons/',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#ffffff',
                margin: '28%'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override'
            },
            androidChrome: {
                pictureAspect: 'shadow',
                themeColor: '#53b9e9',
                manifest: {
                    name: 'Aori',
                    startUrl: 'http://aori.ru',
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'blackAndWhite',
                threshold: 74.84375,
                themeColor: '#53b9e9'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run 
// this task whenever you modify a page. You can keep this task 
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    gulp.src(['templates/favicon.jade'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('templates/'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your 
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});


gulp.task('create-favicon-file', function() {
    var str = '';
    return file('favicon.jade', str).pipe(gulp.dest('templates/'));
});


gulp.task('jshint', function () {
    return gulp
    .src(['assets/js/*.js', 'js/main.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('uglify', function() {
    return gulp
    .src(['*.js', '!*.min.js'], {
        cwd: 'assets/js/'
    })
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('sass', function () {
    return gulp
    .src('assets/sass/common.sass')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: [
        '> 11%',
        'Chrome >= 10',
        'Explorer >= 6',
        'Opera >= 9',
        'Firefox >= 3.5',
        'Safari >= 4',
        'iOS >= 6'
        ],
        remove: true
    }))
    .pipe(gulp.dest('dist/css/'));
});


gulp.task('cssmin', function () {
    gulp.src(['*.css', '!*.min.css'], {
        cwd: 'dist/css/'
    })
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css/'));
});


gulp.task('copy-fonts', function () {
    return gulp
    .src(['fonts/**'], {
        cwd: 'assets/'
    })
    .pipe(newer('assets/fonts/**'))
    .pipe(gulp.dest('dist/fonts/'));
});


gulp.task('copy-images', function () {
    return gulp
    .src(['**', '!master-favicon.png'], {
        cwd: 'assets/images/'
    })
    .pipe(newer('assets/images/**', '!assets/images/master-favicon.*'))
    .pipe(gulp.dest('dist/images/'));
});


gulp.task('copy-js', function () {
    return gulp
    .src(['*.js', '!*.min.js'], {
        cwd: 'assets/js/'
    })
    .pipe(newer('assets/js/*.js', '!assets/js/*.min.js'))
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('copy-deploy', function () {
    return gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss')
    .pipe(gulp.dest('assets/sass/'));
});


gulp.task('rename-deploy', function () {
    return gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss')
    .pipe(rename(function (path) {
        path.extname += '.bak';
    }))
    .pipe(gulp.dest('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/'));
});


gulp.task('clean-deploy-variables', function () {
    return gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss', {read: false})
    .pipe(clean());
});


gulp.task('clean-deploy-fonts-folder', function () {
    return gulp
    .src('' + path.resolve() + '/dist/fonts/', {read: false})
    .pipe(clean());
});


gulp.task('symlink-variables', function () {
    var variables = gulp
    .src('' + path.resolve() + '/assets/sass/_variables.scss')
    .pipe(symlink('' + path.resolve() + '/bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss'), { force: true })
    .pipe(debug({title: 'unicorn:'}));

    return Promise.all([variables]);
});


gulp.task('symlink-bootstrap', function () {
    var variables = gulp
    .src('' + path.resolve() + '/bower_components/bootstrap-sass/')
    .pipe(symlink('' + path.resolve() + '/assets/sass/bootstrap-sass/'), { force: true })
    .pipe(debug({title: 'unicorn:'}));

    return Promise.all([variables]);
});


gulp.task('symlink-bootstrap-fonts', function () {
    var variables = gulp
    .src('' + path.resolve() + '/bower_components/bootstrap-sass/assets/fonts')
    .pipe(symlink('' + path.resolve() + '/dist/fonts/'), { force: true })
    .pipe(debug({title: 'unicorn:'}));

    return Promise.all([variables]);
});


gulp.task('banner', function() {
    var css = gulp
    .src(['*.css'], {
        cwd: 'dist/css/'
    })
    .pipe(banner(signature))
    .pipe(gulp.dest('dist/css/'));

    var js = gulp
    .src(['*.js'], {
        cwd: 'dist/js/'
    })
    .pipe(banner(signature))
    .pipe(gulp.dest('dist/js/'));    

    return Promise.all([css, js]);
});


gulp.task('watch-sass', function() {
    livereload.listen();
    return gulp
    .watch(['assets/sass/*.sass', 'assets/sass/*.scss', '!assets/sass/variables.scss'], gulpSync.sync(['sass', 'cssmin']))
    .on('change', stackReload);
});

gulp.task('watch-js', function() {
    livereload.listen();
    return gulp
    .watch('assets/js/*.js', ['jshint', 'uglify', 'copy-js'])
    .on('change', stackReload);
});

gulp.task('watch-images', function() {
    livereload.listen();
    return gulp
    .watch(['assets/images/*.{png,jpg,gif,bmp}'], ['copy-images'])
    .on('change', stackReload);
});


gulp.task('watch-fonts', function() {
    livereload.listen();
    return gulp
    .watch('assets/fonts/**', ['copy-fonts'])
    .on('change', stackReload);
});

gulp.task('watch-templates', function() {
    livereload.listen();
    return gulp
    .watch('templates/*.jade', ['templates'])
    .on('change', stackReload);
});


// Project main deploy
gulp.task('deploy', gulpSync.sync(
    [   
        // Sync
        [
            // Async
            'copy-deploy',
            'rename-deploy',
            'clean-deploy-variables'
        ],
        [
            'symlink-variables',
            'symlink-bootstrap'
        ]
    ]
));

 
gulp.task('templates', function() {
    gulp.src('templates/index.jade')
    .pipe(jade({
        pretty: '\t'
    }))
    .pipe(gulp.dest(''))
});


gulp.task('sass + cssmin', gulpSync.sync(['sass', 'cssmin']));
gulp.task('bootstrap-fonts', gulpSync.sync(['clean-deploy-fonts-folder', 'symlink-bootstrap-fonts']));
gulp.task('copy', ['copy-fonts', 'copy-images', 'copy-js']);
gulp.task('copy + banner', gulpSync.sync(['copy', 'banner']));
gulp.task('watch', ['watch-sass', 'watch-js', 'watch-images', 'watch-fonts', 'watch-templates']);

// gulp.task['favicon-group']
gulp.task('favicon', gulpSync.sync(['generate-favicon', 'inject-favicon-markups']));

gulp.task('default', ['jshint', 'uglify', 'sass + cssmin', 'bootstrap-fonts', 'copy + banner', 'templates', 'watch']);