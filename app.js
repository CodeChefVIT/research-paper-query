var express         = require("express"),
    request         = require("request"),
    bodyParser      = require("body-parser"),
    open            = require("open"),
    app             = express(),
    cheerio         = require('cheerio'),
    port            = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: true}))

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir))
app.set("view engine","ejs")

// ---------------ROUTES-----------------
var articleList = []
var searchTerm  = ""
var found

app.get('/', (req,res) => {
    res.render('home.ejs')
})

// this receives the search term from the home page , makes api call to ieee , insitializes articleList and seachTerm
app.post('/', (req,res) => {        
    searchTerm = req.body.articleName
    if(searchTerm!=''){
        var apiUrl = `http://ieeexploreapi.ieee.org/api/v1/search/articles?apikey=9bhdjqu9tzebjdm5xjr9p6xw&format=json&max_records=10&start_record=1&sort_order=asc&sort_field=article_number&abstract=${searchTerm}`
        request(apiUrl, (error, response, resBody) => {
            found = false
            if(!error && response.statusCode==200){
                json = JSON.parse(resBody)
                if(json.total_records>0){
                    found = true
                }
                articleList = json['articles']
                res.redirect('/articles')
            }
            else{
                console.log('error detected')
            }
        })
    }
    else{
        res.redirect('back')
    }
    
})

app.get('/articles', (req,res) => {
    res.render('articles.ejs', {'articles': articleList, 'searchTerm': searchTerm, 'found': found})
})

app.get('/articles/:doiPart1/:doiPart2', (req,res) => {
    var doi = `${req.params.doiPart1}/${req.params.doiPart2}`

    articleList.forEach((article) => {
        if(article.doi == doi){
            res.render('showArticle.ejs', {article: article})
        }
    })
})

app.get('/articles/:doiPart1/:doiPart2/download', (req,res) => {
    // the doi is recieved in two parameters as the doi is to the form part1/part2
    // var doi = `${req.params.doiPart1}/${req.params.doiPart2}`            
    // var url = `http://sci-hub.tw/${doi}`
    var downloadLink = 'https://www.google.com/'
    console.log(downloadLink)
    open(downloadLink)

    // request(url, (err, res, html) => {
        
    //     setTimeout(() => {
    //         if(!err && res.statusCode==200){
        
    //             var $ = cheerio.load(html)
                
    //             var saveButtonVal = $('#buttons ul li:nth-child(2) a').attr('onclick')
    //             var len = saveButtonVal.length
    //             // var downloadLink = saveButtonVal.substring(15,len-1)
    //             var downloadLink = 'https://www.google.com/'
    //             console.log(downloadLink)
    //             open(downloadLink)
    
    //         }
    //         else{
    //             open(url)
    //         }
            
    //     }, 5000);
        
    })

})

app.listen(port,()=> console.log(`server connected to PORT: ${port}`))