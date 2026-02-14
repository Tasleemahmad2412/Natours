class APIFeatures {
  constructor(query, queryString) {
    /*
     * query = Tour.find() gives all the Tours and we can perform our operations on it as we see fit like we did Pagination etc
     * queryString = req.query (return a query string e.g ?duration=5&difficulty=easy) which we can use to filter our data
     * we perform our operations on query (Tour.find()) and we filter or make the string as we want to perform certain
     * operations on the string
     * using queryString
     TODO: Have to understand this classes in Js and also OOPs (this Keyword)
     */
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(req.query, queryObj);
    // console.log(JSON.parse(queryStr));
    // Recommended way that we start chaining the special mongoose methods to build the query
    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    // console.log(this.query, this.queryString, this);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
      // if there are 2 objects with same price then we have to add another criteria to sort them
      // sort('price ratingsAverage')
    } else {
      // if user does not add my sorting param
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // 3) FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  pagination() {
    // 4) PAGINATION

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
