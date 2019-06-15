var express         = require("express"),
    request         = require("request"),
    bodyParser      = require("body-parser"),
    open            = require("open"),
    app             = express(),
    {Builder, By}   = require("selenium-webdriver")

app.use(bodyParser.urlencoded({extended: true}))

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir))
app.set("view engine","ejs")

// ---------------ROUTES-----------------
var articleList = []
var searchTerm  = ""

app.get('/', (req,res) => {
    res.render('home.ejs')
})

// this receives the search term from the home page , makes api call to ieee , insitializes articleList and seachTerm
app.post('/', (req,res) => {        
    searchTerm = req.body.articleName
    var apiUrl = `http://ieeexploreapi.ieee.org/api/v1/search/articles?apikey=9bhdjqu9tzebjdm5xjr9p6xw&format=json&max_records=5&start_record=1&sort_order=asc&sort_field=article_number&abstract=${searchTerm}`

    request(apiUrl, (error, response, resBody) => {
        if(!error && response.statusCode==200){
            json = JSON.parse(resBody)
            articleList = json['articles']
            res.redirect('/articles')
        }
    })
})

app.get('/articles', (req,res) => {
    res.render('articles.ejs', {'articles': articleList, 'searchTerm': searchTerm})
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
    var doi = `${req.params.doiPart1}/${req.params.doiPart2}`            
    var url = `http://sci-hub.tw/${doi}`

    var driver = new Builder()
            .forBrowser('chrome')
            .build()
    driver.get(url)
        .then(() => {
            driver.findElement(By.partialLinkText('save')).click()
        })
        .catch((err) => {
            open(url)
            res.redirect('/articles')
        })
        res.redirect(`/articles/${doi}`)
})

app.listen(3000,()=> console.log('server connected to PORT: 3000'))
