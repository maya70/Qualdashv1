library(shiny)
library(readr)
library(lubridate)
library(parsedate)
library(dplyr)

# Define UI for data upload app ----
ui <- fluidPage(

  # App title ----
  titlePanel("Upload Audit File"),

  # Sidebar layout with input and output definitions ----
  sidebarLayout(

    # Sidebar panel for inputs ----
    sidebarPanel(

      # Input: Select a file ----
      fileInput("file1", "Choose CSV File",
                multiple = TRUE,
                accept = c("text/csv",
                         "text/comma-separated-values,text/plain",
                         ".csv")),

      # Horizontal line ----
      tags$hr(),

      # Input: Checkbox if file has header ----
      checkboxInput("header", "Header", TRUE),

      # Input: Select separator ----
      radioButtons("sep", "Separator",
                   choices = c(Comma = ",",
                               Semicolon = ";",
                               Tab = "\t"),
                   selected = ","),

      # Input: Select quotes ----
      radioButtons("quote", "Quote",
                   choices = c(None = "",
                               "Double Quote" = '"',
                               "Single Quote" = "'"),
                   selected = '"'),

      # Horizontal line ----
      tags$hr(),

      # Input: Select number of rows to display ----
      radioButtons("disp", "Display",
                   choices = c(Head = "head",
                               All = "all"),
                   selected = "head")

    ),

    # Main panel for displaying outputs ----
    mainPanel(

      # Output: Data file ----
      tableOutput("contents")

    )

  )
)

# Define server logic to read selected file ----
server <- function(input, output) {

  output$contents <- renderTable({

    # input$file1 will be NULL initially. After the user selects
    # and uploads a file, head of that data file by default,
    # or all rows if selected, will be shown.

    req(input$file1)

    df1 <- read.csv(input$file1$datapath,
             header = input$header,
             sep = input$sep,
             quote = input$quote,
             na.strings=c("","NA"))

   
    ##########################################################################

    ########################## Main parameters #######################
    dest_file_path <- "C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/"
    dateFormat <- '%d/%m/%Y %H:%M'
    madmission <- df1
    
    # select all date fields in data
    allDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x), format =dateFormat))))
    df <- as.data.frame(allDates)
    colnames(df) <- colnames(madmission)
    dateFields <- df[which(df==TRUE)]

      # Unify date formats to ISO format 
      vec <- madmission[,1]
    for(col in colnames(madmission)){
        if(col %in% colnames(dateFields)){
         vector <- madmission[col]
         temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
      
         # drop the current column in original format
         madmission <- madmission[, !(names(madmission)== col)]
         # append the newly formatted date field
         madmission <- cbind(madmission, temp)
        }
    }

    # Add other formats 
    # dateFormat <- "%d/%m/%Y"
    dateFormat <- "%d-%m-%y"
    otherDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x), format = dateFormat))))
    df2 <- as.data.frame(otherDates)
    colnames(df2) <- colnames(madmission)
    dateFields2 <- df2[which(df2==TRUE)]

    # Unify date formats to ISO format 
    for(col in colnames(madmission)){
        if(col %in% colnames(dateFields2)){
         vector <- madmission[col]
         temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
         # drop the current column in original format
         madmission <- madmission[, !(names(madmission)== col)]
         # append the newly formatted date field
         madmission <- cbind(madmission, temp)

        }
    }

    dateFormat <- "%d-%m-%Y"
    otherDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x), format = dateFormat))))
    df2 <- as.data.frame(otherDates)
    colnames(df2) <- colnames(madmission)
    dateFields2 <- df2[which(df2==TRUE)]

    # Unify date formats to ISO format 
    for(col in colnames(madmission)){
      if(col %in% colnames(dateFields2)){
        vector <- madmission[col]
        temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
        # drop the current column in original format
         madmission <- madmission[, !(names(madmission)== col)]
         # append the newly formatted date field
         madmission <- cbind(madmission, temp)
        
      }
    }
    

    # get years in data
    # first find the date field
    #admdate <- madmission$`X3.06.ArrivalAtHospital`
    admdate1 <- madmission %>% select(contains("3.06"))
    admdate <- madmission[ , colnames(madmission) %in% colnames(admdate1)]
    # then calculate year
    adyear <- as.integer(year(admdate))
    madmission <- cbind(madmission, adyear)

    # Derived columns
    #v427 <- madmission$`4.27 Thienopyridine Inhibitor` == '1. Yes'
    #v431 <- madmission$`4.31 Ticagrelor` == '1. Yes'
    av427 <- madmission %>% select(contains("4.27"))
    v427 <-  av427 == '1. Yes'
    av431 <-  madmission %>% select(contains("4.31"))
    v431 <- av431 == '1. Yes'
    madmission$P2Y12 <- as.numeric(v431 | v427)

    balloon1 <- madmission %>% select(contains("3.09"))
    balloon <- madmission[, colnames(madmission) %in% colnames(balloon1)]
    dtb  <- balloon - admdate
    madmission$dtb <- as.numeric(dtb)

    call1 <- madmission %>% select(contains("3.02"))
    call <- madmission[, colnames(madmission) %in% colnames(call1)]
    ctb <- balloon - call
    madmission$ctb <- as.numeric(ctb)
    madmission$ctbTarget <- as.numeric(ctb <= 120.0)
    madmission$ctbNoTarget <- as.numeric(ctb > 120.0)

    angio1 <- madmission %>% select(contains("4.18"))
    angio <- madmission[, colnames(madmission) %in% colnames(angio1)]
    dta <- angio - admdate
    madmission$dta <- as.numeric(dta)
    dtaH <- as.numeric(dta) / 60
    madmission$dta <- as.numeric(dtaH)
    madmission$dtaTarget <- as.numeric(dtaH < 72.0)
    madmission$dtaNoTarget <- as.numeric(dtaH > 72.0)


    beta <- madmission %>% select(contains("4.05"))
    acei <- madmission %>% select(contains("4.06"))
    statin <- madmission %>% select(contains("4.07"))
    aspirin <- madmission %>% select(contains("4.08"))

    madmission$missingOneDrug <- as.numeric( madmission$'P2Y12' == 0 | beta == '0. No' | acei == '0. No' | statin== '0. No' | aspirin == '0. No' )

    
    # break it into separate files for individual years
    # and store the new files in the MINAP admissions folder under documnt root 
    for(year in unique(adyear)){
      tmp = subset(madmission, adyear == year)
      fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
      write.csv(tmp, fn, row.names = FALSE)
      
    }
    for(year in sort(unique(adyear))){
      prevYear = year - 1
      start = paste(prevYear, '-04-01 00:00:00 GMT', sep='')
      end = paste(year, '-03-31 00:00:00 GMT', sep='' )
      
      tmp2 = subset(madmission, (pmin(as.Date(madmission$`3.06 Admission Date/Time`), as.Date(start)) == as.Date(start)) &  (pmin(as.Date(madmission$`3.06 Admission Date/Time`), as.Date(end)) == as.Date(madmission$`3.06 Admission Date/Time`)) )
      fn = paste(dest_file_path, gsub(' ','', prevYear),'-', gsub(' ','', year), '.csv', sep='' )
      write.csv(tmp2, fn, row.names = FALSE)
    }

    # APPEND to existing available years
    yfn = paste(dest_file_path, 'avail_years.csv', sep='' );
    av <- read_csv(yfn);
    temp <- av$x;
    vec <- vector() 
    for(str in temp){
        if(nchar(str)== 4)
            vec <- c(vec, str)
    }

    for(year in unique(madmission$adyear)){
      if(!(year %in% vec)){
        temp <- c(temp, year)
      }
    }

    for(year in unique(madmission$adyear)){
      prev = year -1 
      dashed = paste(gsub(' ','', prev),'-', gsub(' ','', year), sep='')
      if(! (dashed %in% temp))
        temp <- c(temp, dashed) 
    }
    write.csv(temp, yfn, row.names = FALSE)


    ##########################################################################
     if(input$disp == "head") {
      return(head(madmission))
    }
    else {
      return(madmission)
    }



  })

}

# Create Shiny app ----
shinyApp(ui, server)
