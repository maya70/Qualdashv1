 library(readr)
 library(lubridate)
 
 # Change the unit ID to match your unit
 unitID <- "194281" 

 # read raw admission data from its current location
 admission <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/admission.csv")
 admission <- subset(admission, siteidscr == unitID)
 # break it into separate files for individual years
 # and store the new files in the picanet folder under documnt root 
 for(year in unique(admission$adyear)){
     tmp = subset(admission, adyear == year)     
     fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_admission/', gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

yfn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_admission/avail_years.csv', sep='' )
 write.csv(unique(df$adyear), yfn, row.names = FALSE)


 # read raw activity data
  activity <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/activity.csv")

  # split activity file by year of admission
  myvars <- c("adyear", "eventidscr")
  newdata <- admission[myvars]
  df <- merge(newdata, activity, by='eventidscr')
   #for(year in unique(df$adyear)){
    # tmp = subset(df, adyear == year)
    # fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/', gsub(' ','', year), '.csv', sep='' )
    # write.csv(tmp, fn, row.names = FALSE)
    #}

 # get the latest year in your data
 #maxyear <- max(admission$adyear, na.rm = TRUE)

for(year in unique(df$adyear)){
   # read the admission records for the current year alone
   fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_admission/', gsub(' ','', year), '.csv', sep='' )
   cur_adm <- read.csv(fn)
   # merge the activity file
   M <- merge(cur_adm, activity, by=c('eventidscr'), all.x=T)

   # select only relevant columns for QualDash
    d = data.frame(M$eventidscr, M$addate, M$hrggroup, M$unplannedextubation, M$invventet, M$invventtt, M$intubation, M$ventilationstatus, M$avsjet, M$avsosc, M$siteidscr)
    colnames(d) <- c('eventidscr', 'addate', 'hrggroup', 'unplannedextubation', 'invventet', 'invventtt', 'intubation', 'ventiliationstatus', 'avsjet', 'avsosc', 'siteidscr')

    fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/shortactiv', gsub(' ','', year), '.csv', sep='' )
    write.csv(d, fn)
}

 # read the activity records for the latest year alone
#fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/', gsub(' ','', maxyear), '.csv', sep='' )
# latest_activ <- read.csv(fn)

 
