 library(readr)
 library(lubridate)
 library(parsedate)

 
 # Change the unit ID to match your unit
 unitID <- "194281" 
 source_file_path <- "C:/Users/scsmel/Dropbox/Leeds/Qualdash related/Data/"
 dest_file_path <- "C:/Bitnami/wampstack-7.1.13-1/apache2/htdocs/Qualdashv1/home/data/picanet_admission/"
 dest_activity_path <- "C:/Bitnami/wampstack-7.1.13-1/apache2/htdocs/Qualdashv1/home/data/picanet_activity/"
 audit_filename <- "admission.csv"
 
 source = paste(source_file_path, audit_filename, sep='')

 
 # read raw admission data from its current location
 admission <- read_csv(source)
 admission <- subset(admission, PicuOrg == unitID)
 # break it into separate files for individual years
 # and store the new files in the picanet folder under documnt root 
 #for(year in unique(admission$adyear)){
  #   tmp = subset(admission, adyear == year)     
  #   fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
  #  write.csv(tmp, fn, row.names = FALSE)
 #}

 admdate <- as.Date(admission$adDate, format=dateFormat)
 adyear <- year(admdate)
 admission <- cbind(admission, adyear)

yfn = paste(dest_file_path ,'avail_years.csv', sep='' )
 write.csv(unique(admission$adyear), yfn, row.names = FALSE)


 # read raw activity data
 source = paste(source_file_path, "activity.csv", sep='')
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
    d = data.frame(M$EventID, M$adDate, M$PccHrg, M$UnplannedExtubation, M$InvVent, M$Intubation, M$ventilationstatus, M$PicuOrg)
    colnames(d) <- c('EventID', 'adDate', 'hrggroup', 'UnplannedExtubation', 'InvVent', 'Intubation', 'VentiliationStatus', 'PicuOrg')

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

 # read the activity records for the latest year alone
#fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/', gsub(' ','', maxyear), '.csv', sep='' )
# latest_activ <- read.csv(fn)

 
