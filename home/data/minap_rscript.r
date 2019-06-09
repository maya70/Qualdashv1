 # read raw admission data from its current location
 library(readr)
 library(lubridate)
 library(parsedate)
 madmission <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/minap_dummy.csv")
 dateFormat <- "%d-%m-%y %H:%M"
 # get years in data
 admdate <- as.Date(madmission$`3.06 Date/time arrival at hospital`, format=dateFormat)
 adyear <- year(admdate)
 madmission <- cbind(madmission, adyear)

# Select all columns with Date data type
allDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x),format=dateFormat))))
df <- as.data.frame(allDates)
colnames(df) <- colnames(madmission)
dateFields <- df[which(df==TRUE)]

#TODO: unify date formats to ISO format here
for(col in colnames(madmission)){
    if(col %in% colnames(dateFields)){
    	vector <- madmission[col]
    	temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
    	madmission[col] <- temp

    }
}

 # break it into separate files for individual years
 # and store the new files in the MINAP admissions folder under documnt root 
 for(year in unique(adyear)){
     tmp = subset(madmission, adyear == year)
     fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/', gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 yfn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/avail_years.csv', sep='' )
 write.csv(unique(adyear), yfn, row.names = FALSE)

 