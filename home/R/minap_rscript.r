 library(readr)
 library(lubridate)
 library(parsedate)

 source_file_path <- "C:/Bitnami/wampstack-7.1.29-0/apache2/htdocs/qualdash/home/data/"
 dest_file_path <- "C:/Bitnami/wampstack-7.1.29-0/apache2/htdocs/qualdash/home/data/minap_admission/"
 dateFormat <- '%d/%m/%Y %H:%M'
 audit_filename <- "Ami-1-4-16 - 31-3-19.csv"
 
 source = paste(source_file_path, audit_filename, sep='')
 madmission <- read_csv(source)

 # get years in data

 admdate <- as.Date(madmission$`3.06 Date/time arrival at hospital`, format=dateFormat)
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
v427 <- madmission$`4.27 Discharged on a thienopyridine inhibitor` == '1. Yes'
v431 <- madmission$`4.31 Discharged on TIcagrelor (v10.3 Dataset)` == '1. Yes'

madmission$P2Y12 <- as.numeric(v431 | v427)

dtb <- madmission$`3.09 Date/time of reperfusion treatment` - madmission$`3.06 Date/time arrival at hospital`
madmission$dtb <- as.numeric(dtb)

dta <- madmission$`4.18 Local angio date` - madmission$`3.06 Date/time arrival at hospital`
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