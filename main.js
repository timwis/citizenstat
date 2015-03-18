var Incidents = Backbone.Collection.extend({
  baseUrl: 'http://staging-gis.phila.gov/arcgis/rest/services/PhilaGov/Police_Incidents/MapServer/0/query',
  settings: {
    where: 'DISPATCH_DATE_TIME >= date \'2015-01-01\' AND dc_dist = \'24\'',
    groupByFieldsForStatistics: 'dispatch_date, text_general_code',
    outStatistics: '[{"statisticType":"count", "onStatisticField":"objectid", "outStatisticFieldName":"Count"}]',
    returnGeometry: false,
    returnIdsOnly: false,
    returnCountOnly: false,
    f: 'json'
  },
  url: function() {
    return this.baseUrl + '?' + $.param(this.settings); // need to URL encode the settings first
  },
  parse: function(response, options) {
    return response.features ? _.pluck(response.features, 'attributes') : [];
  },
  comparator: 'dispatch_date'
});

var LineChart = Backbone.View.extend({
  el: '#main',
  initialize: function() {
    this.collection.on('sync', this.render, this);
  },
  render: function() {
    console.log('Rendering', this.collection.toJSON());

    var data = _.groupBy(this.collection.toJSON(), 'text_general_code');
    //debugger
    data = _.map(data, function(val, key) {
        return {
          name: key,
          data: _.map(val, function(val) { return [ Date.parse(val.dispatch_date), val.Count ] })
        }
      });
    console.log(data);

    this.$el.highcharts({
      chart: {
        type: 'line'
      },
      title: {
        text: 'Crime Statistics'
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: 'Incidents'
        }
      },
      series: data
    });
  }
})

var incidents = new Incidents(),
  lineChart = new LineChart({collection: incidents});

incidents.fetch();
