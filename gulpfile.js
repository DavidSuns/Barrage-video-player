var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['auto']);

gulp.task('css', function () {
    gulp.src('css/*.css')
        .pipe(concat('abpPlayer.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/css'))
});

gulp.task('js', function () {
    gulp.src('js/*.js')
        .pipe(concat('abpPlayer.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

gulp.task('copyFont', function () {
    gulp.src('fonts/*.*')
        .pipe(gulp.dest('dist/fonts'))
});

gulp.task('auto', function() {
  gulp.watch('css/*.css', ['css']);
  gulp.watch('js/*.js', ['js']);
  gulp.watch('fonts/*.*', ['copyFont']);
});
