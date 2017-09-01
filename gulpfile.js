var
  gulp      = require('gulp'),
  bs        = require('browser-sync'),
  sass      = require('gulp-sass'),
  jade      = require('gulp-jade'),
  prefix    = require('gulp-autoprefixer'),
  gutil     = require('gulp-util'),
  notify    = require('gulp-notify'),
  sequence  = require('run-sequence'),
  plumber   = require('gulp-plumber'),
  cp        = require('child_process'),
  jekyll    = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll',
  messages  = {jekyllBuild: '<span style="color: grey">Running: Jekyll Build'},
  paths     = {//added paths for ease
    cssSrc      : 'assets/css/main.scss',
    cssDir      : ['assets/css/**', '! assets/css/main.css'],
    jsSrc       : 'assets/js/**',
    jekyllSrc   : ['*.html', '_layouts/*.html', '_includes/*'],
    jadeSrc     : '_jade/*.jade',
    cssDest     : '_site/assets/css',
    cssDest2    : 'assets/css',
    jadeDest    : '_includes',
    baseDir     : '_site'
  };
var onError = function (err) {
  var errorLine   = (err.line) ? 'Line ' + err.line : '',
  errorTitle  = (err.plugin) ? 'Error: [ ' + err.plugin + ' ]' : 'Error';
  notify.logLevel(0);
  notify({
      title: errorTitle,
      message: errorLine
  }).write(err);
  gutil.log(gutil.colors.red('\n'+errorTitle+'\n\n', err.message));
  this.emit('end');
};

gulp.task('jekyll-build', function (done) {
  bs.notify(messages.jekyllBuild);
  return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
    .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  bs.reload();
});

gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
  bs({
    server: {
      baseDir: paths.baseDir
    }, notify: false, open: false
  });
});

gulp.task('sass', function () {
  return gulp.src(paths.cssSrc)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({
      includePaths: ['scss'],
      outputStyle: 'compressed'
      }))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest(paths.cssDest))
    .pipe(bs.reload({stream:true}))
    .pipe(gulp.dest(paths.cssDest2));
});

gulp.task('jade', function() {
  return gulp.src(paths.jadeSrc)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jade())
    .pipe(gulp.dest(paths.jadeDest));
});

gulp.task('watch', ['build'], function () {
  gulp.watch(paths.cssDir, ['sass']);
  gulp.watch(paths.jadeSrc, ['jade']);
  gulp.watch(paths.jekyllSrc, ['jekyll-rebuild']);
  gulp.watch(paths.jsSrc, ['jekyll-rebuild']);
});

gulp.task('build', function(done){
  sequence(['jade','sass'],'jekyll-build','browser-sync',done);
});

gulp.task('default', ['watch']);
