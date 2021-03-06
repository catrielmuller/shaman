var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    htmlreplace = require('gulp-html-replace'),
    node,
    watch = require('gulp-watch'),
    uglify = require('gulp-uglifyjs'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass');
    runSequence = require('run-sequence'),
    concat = require('gulp-concat');
    livereload = require('gulp-livereload');


gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['index.js'], {stdio: 'inherit'})
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('server:watch', function(){
    livereload.listen();
    gulp.run('server');
    gulp.watch(['index.js', 'server/*'], function(){
        gulp.run('server');
        livereload();
    });
});

gulp.task('sass', function () {
    gulp.src('./public/assets/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/assets'))
        .pipe(livereload());
});

gulp.task('sass:watch', function () {
    gulp.watch('./public/assets/sass/*.scss', ['sass']);
});
gulp.task('copyDev', function () {
    gulp.run('copy');
    gulp.watch( ['./public/**/*','./public/**/**/*'], ['copy']);    
});

gulp.task('uglify:vendor', function() {
    return gulp.src(['./public/app/pixi.js','./public/app/tween.js','./public/app/socketio.js','./public/app/lodash.js'])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/app'))
});

gulp.task('uglify:app', function() {
   return gulp.src(['!./public/app/pixi.js','!./public/app/socketio.js','!./public/app/lodash.js','!./public/app/tween.js','./public/app/*.js'])
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/app'))
});

gulp.task('htmlCompile', function() {
   return gulp.src('./public/index.html')
        .pipe(htmlreplace({
            'css': 'assets/styles.min.css',
            'vendor': 'app/vendor.js',
            'js': 'app/app.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy', function(){
    gulp.src('./public/**')
        .pipe(gulp.dest('./dist'))
        .pipe(livereload());
});

gulp.task('copy:json', function(){
    gulp.src('./public/assets/*.json')
        .pipe(gulp.dest('./dist/assets'))
        .pipe(livereload());
});

gulp.task('copyImages', function(){
    gulp.src(['./public/assets/*.png', './public/assets/*.jpg', './public/assets/*.gif', './public/assets/*.mp3'])
        .pipe(gulp.dest('./dist/assets'));
});

gulp.task('clean', function(){
    return gulp.src('./dist/**/*', {read: false})
         .pipe(rimraf());
});

gulp.task('dev', ['sass:watch', 'copyDev', 'server:watch'] );

gulp.task('compile',function() {
    runSequence('clean', 'sass', 'copyImages', 'uglify:vendor','uglify:app', 'htmlCompile','copy:json');
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill();
});