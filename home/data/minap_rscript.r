 # read raw admission data from its current location
 library(readr)
 library(lubridate)
 library(parsedate)

 source_file_path <- "C:/Users/scsmel/Dropbox/Leeds/Qualdash related/Data/"
 dest_file_path <- "C:/Bitnami/wampstack-7.1.13-1/apache2/htdocs/Qualdashv1/home/data/minap_admission/"
 #dateFormat <- "%d-%m-%y %H:%M"
 dateFormat <- "%Y-%m-%d %H:%M:%S"
 audit_filename <- "minap_dummy.csv"
 
 source = paste(source_file_path, audit_filename, sep='')
 madmission <- read_csv(source)

 # get years in data
 admdate <- as.Date(madmission$`3.06 ArrivalAtHospital`, format=dateFormat)
 adyear <- year(admdate)
 madmission <- cbind(madmission, adyear)

# Select all columns with Date data type

allDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x), format =dateFormat))))
df <- as.data.frame(allDates)
colnames(df) <- colnames(madmission)
dateFields <- df[which(df==TRUE)]

# Unify date formats to ISO format 
for(col in colnames(madmission)){
    if(col %in% colnames(dateFields)){
    	vector <- madmission[col]
    	temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
    	madmission[col] <- temp

    }
}


# Add other formats 
dateFormat <- "%d/%m/%Y"
otherDates <- lapply(madmission, function(x) !all(is.na(as.Date(as.character(x), format = dateFormat))))
df2 <- as.data.frame(otherDates)
colnames(df2) <- colnames(madmission)
dateFields2 <- df2[which(df2==TRUE)]

# Unify date formats to ISO format 
for(col in colnames(madmission)){
    if(col %in% colnames(dateFields2)){
    	vector <- madmission[col]
    	temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
    	madmission[col] <- temp

    }
}


# Derived columns
v427 <- madmission$`4.27 DischargedOnThieno` == '1. Yes'
v431 <- madmission$`4.31 DischargedOnTicagrelor` == '1. Yes'
madmission$P2Y12 <- as.numeric(v431 | v427)

dtb <- madmission$`3.09 ReperfusionTreatment` - madmission$`3.06 ArrivalAtHospital`
madmission$dtb <- as.numeric(dtb)

dta <- madmission$`4.18 LocalAngioDate` - madmission$`3.06 ArrivalAtHospital`
madmission$dta <- as.numeric(dta)
dtaH <- as.numeric(dta) / 60
madmission$dtaTarget <- as.numeric(dtaH < 72.0)
madmission$dtaNoTarget <- as.numeric(dtaH > 72.0)



 # break it into separate files for individual years
 # and store the new files in the MINAP admissions folder under documnt root 
 for(year in unique(adyear)){
     tmp = subset(madmission, adyear == year)
     fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 yfn = paste(dest_file_path, 'avail_years.csv', sep='' )
 write.csv(unique(adyear), yfn, row.names = FALSE)

 