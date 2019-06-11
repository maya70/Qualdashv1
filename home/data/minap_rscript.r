 # read raw admission data from its current location
 library(readr)
 library(lubridate)
 library(parsedate)

 source_file_path <- "C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/"
 dest_file_path <- "C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/"
 dateFormat <- "%d-%m-%y %H:%M"
 #dateFormat <- "%d/%m/%Y %H:%M"
 audit_filename <- "minap_dummy.csv"
 
 source = paste(source_file_path, audit_filename, sep='')
 madmission <- read_csv(source)

 dateFormat <- "%d-%m-%y %H:%M"
 #dateFormat <- "%d/%m/%Y %H:%M"
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
     fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 yfn = paste(dest_file_path, 'avail_years.csv', sep='' )
 write.csv(unique(adyear), yfn, row.names = FALSE)

 