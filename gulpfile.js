var browserify = require('browserify')
var gulp = require('gulp')
var gutil = require('gulp-util')
var jshint = require('gulp-jshint')
var nodemon = require('gulp-nodemon')
var plumber = require('gulp-plumber')
var react = require('gulp-react')
var sass = require('gulp-sass');
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify')
var mocha = require('gulp-mocha');
var del = require('del');
var exit = require('gulp-exit');

var jsSrcPaths = './src/**/*.js*'
var jsLibPaths = './lib/**/*.js'
//TODO: Not sure if we need to delete all occurance of @insin as it is the name of the repo creator on https://github.com/insin/isomorphic-lab
var bundledDeps = [
    'setimmediate',
    'events',
    'react',
    '@insin/react-router',
    'superagent-ls',
    'newforms',
    'react/lib/Object.assign',
    'lodash',
    'dom-scroll-into-view',
    'change-case',
    'moment',
    'superagent-bluebird-promise',
    'async'
]

process.env.NODE_ENV = gutil.env.production ? 'production' : 'development'


gulp.task('mocha-test', function() {
  require ('babel/register');
  require('./test/setup');
    return gulp.src(['test/**/*Test.js'], { read: false })
        .pipe(mocha({
            reporter: 'spec'
        }))
        .pipe(exit());
})

gulp.task('mocha-watch', function() {
  gulp.watch(['src/**', 'test/**'], ['mocha-test']);
})


gulp.task('transpile-js', function() {
  return gulp.src(jsSrcPaths)
    .pipe(plumber())
    .pipe(react({harmony: true}))
    .pipe(gulp.dest('./lib'))
})

gulp.task('lint-js', ['transpile-js'], function() {
  return gulp.src(jsLibPaths)
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('bundle-js', ['lint-js'], function() {
  var b = browserify('./lib/client.js', {
    debug: !!gutil.env.debug,
    detectGlobals: false
  }).ignore('config')
      .ignore('crypto')
      .ignore('sanitizer')
      .ignore('cheerio')
      .ignore('continuation-local-storage')
      .ignore('log4js')
      .ignore('categoryFilter')

  bundledDeps.forEach(function(dep) { b.external(dep) })
  b.transform('envify')

  var stream = b.bundle()
    .pipe(source('app.js'))

  if (gutil.env.production) {
    stream = stream.pipe(streamify(uglify()))
  }

  return stream.pipe(gulp.dest('./static/application/js'))
})

gulp.task('bundle-deps', function() {
  var b = browserify({
    debug: !!gutil.env.debug,
    detectGlobals: false
  })
  bundledDeps.forEach(function(dep) { b.require(dep) })
  b.transform('envify')

  var stream = b.bundle()
    .pipe(source('deps.js'))

  if (gutil.env.production) {
    stream = stream.pipe(streamify(uglify()))
  }

  return stream.pipe(gulp.dest('./static/application/js'))
})


gulp.task('sass', function () {
  gulp.src('./src/styles/application-styles.scss')
      .pipe(sass({errLogToConsole: true}))
      .pipe(gulp.dest('./static/application/css'));
});


gulp.task('clean:lib', function() {
  del.sync(['lib/**/*']); //TODO: deleting the entire directory is not working so deleting the content
});


gulp.task('clean', ['clean:lib'])

gulp.task('bundle', ['clean','sass', 'bundle-deps', 'bundle-js'])

gulp.task('default', ['bundle'])

