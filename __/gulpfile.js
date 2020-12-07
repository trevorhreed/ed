var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    liveServer = require('live-server');

var SRC = './src/**/*.js',
    DST = './dist',
    EXAMPLE = './example';

function serveExample(done){
  liveServer.start({
    root: EXAMPLE
  });
  done();
}

function watchJs(done){
  watch(SRC, function(){
    gulp.src(SRC)
      .pipe(plumber())
      .pipe(concat('ed.js'))
      .pipe(gulp.dest(DST))
      .pipe(gulp.dest(EXAMPLE))
      //.on('end', done);
  });
}

gulp.task('serve', serveExample);
gulp.task('watch', watchJs);
gulp.task('default', ['watch', 'serve']);
