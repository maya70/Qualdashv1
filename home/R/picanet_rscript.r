library(readr)
 library(lubridate)
 library(parsedate)

source_file_path <- "//xCMMC.nhs.uk/UserData$/Redir/Taric.Sheikh/Documents/QualDash/"
 dest_file_path <- "C:/Bitnami/wampstack-7.3.6-2/apache2/htdocs/qualdash/home/data/picanet_admission/"
 dest_activity_path <- "C:/Bitnami/wampstack-7.3.6-2/apache2/htdocs/qualdash/home/data/picanet_activity/"
 
 audit_filename <- "admission.csv"
 #dateFormat <- "%d-%m-%y %H:%M"
 dateFormat <- "%d/%m/%Y %H:%M:%S"
 
 
 source = paste(source_file_path, audit_filename, sep='')
# read raw admission data from its current location
 admission <- read_csv(source)
 #admission <- subset(admission, PicuOrg == unitID)

# get years in data
 admdate <- as.Date(paste(admission$AdDate), dateFormat)
 adyear <- year(admdate)
 admission <- cbind(admission, adyear)

allDates <- lapply(admission, function(x) !all(is.na(as.Date(as.character(x), format =dateFormat))))
df <- as.data.frame(allDates)
colnames(df) <- colnames(admission)
dateFields <- df[which(df==TRUE)]

# Unify date formats to ISO format 
for(col in colnames(admission)){
    if(col %in% colnames(dateFields)){
         vector <- admission[col]
         temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
         admission[col] <- temp
         
     }
 }

# break it into separate files for individual years
 # and store the new files in the picanet folder under documnt root 
 for(year in unique(admission$adyear)){
     tmp = subset(admission, adyear == year)     
     fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
    write.csv(tmp, fn, row.names = FALSE)
 }


########

yfn = paste(dest_file_path ,'avail_years.csv', sep='' )
write.csv(unique(admission$adyear), yfn, row.names = FALSE)


# read raw activity data
source = paste(source_file_path, "2016-2018 PICANet Export for QD_activity.csv", sep='')
activity <- read_csv(source)

# split activity file by year of admission
myvars <- c("adyear", "EventID")
newdata <- admission[myvars]
df <- merge(newdata, activity, by='EventID')

# get the latest year in your data
#maxyear <- max(admission$adyear, na.rm = TRUE)

for(year in unique(df$adyear)){
    # read the admission records for the current year alone
    fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
    cur_adm <- read.csv(fn)
    # merge the activity file
    M <- merge(cur_adm, activity, by=c('EventID'), all.x=T)
    
    # select only relevant columns for QualDash
    d = data.frame(M$EventID, M$AdDate, M$PccHrg)
    colnames(d) <- c('EventID', 'adDate', 'hrggroup')
    
    for(level in unique(d$hrggroup)){
        admission[, toString(level) ] <- 0
    }
    
    for(row in 1:nrow(d)){
        id <- d$EventID[row] 
        level <- d$hrggroup[row]
        lev <- toString(level[1])
        admission[which(admission$EventID == id), lev] <- 1 + admission[which(admission$EventID == id), lev]
        
    }
    tmp = subset(admission, adyear == year)     
    fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
    write.csv(tmp, fn, row.names = FALSE)
    
    fn = paste(dest_activity_path, 'shortactiv' , gsub(' ','', year), '.csv', sep='' )
    write.csv(d, fn)
}
