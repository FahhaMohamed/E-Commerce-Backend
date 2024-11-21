class APIFeatures {
    constructor(query, queryStr) {
        this.query = query,
        this.queryStr = queryStr
    }

    //creating search functionality

    search() {
        let keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i', //for case sensitive
            }
        } : {};

        this.query.find({...keyword})
        return this;

    }

    //creating filter category functionality

    filter() {
        const queryStrCopy = { ...this.queryStr };

        //before
        console.log(queryStrCopy);

        //removing fields from query
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach( field => delete queryStrCopy[field])

        //after
        console.log(queryStrCopy);

        //filter price :- price[lt]=   or price[gt]=
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`); //should add  $ sign

        this.query.find(JSON.parse(queryStr));

        

        return this;
    }


    //create Pagination functionality

    paginate(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1);

        this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}

module.exports = APIFeatures;