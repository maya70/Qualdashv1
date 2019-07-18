
     library(readr)
     library(lubridate)
     library(parsedate)
    
     
     # Change the unit ID to match your unit
     unitID <- "PIC006" 
     source_file_path <- "G:/CIO Team/QualDash/"
     dest_file_path <- "G:/CIO Team/QualDash/picanet_admission/"
     dest_activity_path <- "G:/CIO Team/QualDash/picanet_activity/"
     audit_filename <- "admission PICANetWeb-EventData-2019-06-24-102510-PIC006DSmedehol.csv"
     activity_filename <- "activity PICANetWeb-EventData-2019-06-24-102510-PIC006DSmedehol.csv"
     
     
     source = paste(source_file_path, audit_filename, sep='')
    
     
     # read raw admission data from its current location
     admission <- read_csv(source)
     admdate <- as.Date(paste(admission$AdDate), "%m/%d/%Y") 
     adyear <- year(admdate)
     admission <- cbind(admission, adyear)
     for(year in unique(admission$adyear)){
         tmp = subset(admission, adyear == year)     
         fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
        write.csv(tmp, fn, row.names = FALSE)
     }
    
    
     yfn = paste(dest_file_path ,'avail_years.csv', sep='' )
     write.csv(unique(admission$adyear), yfn, row.names = FALSE)
    
    
     # read raw activity data
      source = paste(source_file_path, activity_filename, sep='')
      activity <- read_csv(source)
    
      # split activity file by year of admission
      myvars <- c("adyear", "EventID")
      newdata <- admission[myvars]
      df <- merge(newdata, activity, by='EventID')
      u <- as.data.frame(unique(df$adyear))
      colnames(u) <- c("years")
      s <- u[!is.na(u$years),]
    
    for(year in s){
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
    

